import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import calendar from "@assets/icons/calendar.svg";
import resetIcon from "@assets/icons/reset.svg";
import cancelIcon from "@assets/icons/cancel.svg";
import token from "@utils/token";
import EmployeeListComponent from "@components/Search/EmployeeListComponent";
interface ListItem {
  id: number;
  employeeName: string;
  suName: string;
  ipName: string;
  erdatStart : string;
  erdatEnd: string;
}
interface UserInfo {
  name: string;
  role: string;
  employeeId: string;
}

const EmployeeSearchComponent: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");

    if (storedUser) {
        try {
            const parsedUser: UserInfo = JSON.parse(storedUser);
            setUserInfo(parsedUser);
        } catch (error) {
            console.error("JSON 파싱 오류:", error);
        }
    }
}, []);

useEffect(() => {
    if (userInfo) {
        console.log("userInfo 업데이트됨, fetchSearchResults 실행", userInfo);
        fetchSearchResults(userInfo);
    }
}, [userInfo]); 

  const [filters, setFilters] = useState({
    writer: "",
    supplier: "",
    recipient: "",
    approvalNumber1: "",
    approvalNumber2: "",
    approvalNumber3: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  console.log("API 요청 URL:", import.meta.env.VITE_BACKEND_URL + "/v1/receipt/search");
  const [searchResults, setSearchResults] = useState<ListItem[]>([]);
  const fetchSearchResults = async (userInfo) => {
    const requestBody = {
      employeeName: filters.writer ? [filters.writer] : [userInfo.name],
      suNames: filters.supplier ? [filters.supplier] : null,
      ipNames: filters.recipient ? [filters.recipient] : null,
      erdatStart: filters.startDate ? filters.startDate.toISOString().split("T")[0] : null,
      erdatEnd: filters.endDate ? filters.endDate.toISOString().split("T")[0] : null,
    };
  
    console.log("전송할 requestBody:", requestBody);
  
    try {
      const response = await token.post("/v1/receipt/search", requestBody);
      console.log("검색 결과:", response.data);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    }
  };

  const [selectedFilter, setSelectedFilter] = useState<string | null>("전체");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue = value.slice(0, 8);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: filteredValue,
    }));
  };
  
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
    if (e.nativeEvent.isComposing) return;
  
    if (e.key === "Enter") {
      setFilters((prevFilters) => {
        const value = prevFilters[field as keyof typeof prevFilters] as string;
        
        if (value.trim() !== "") {
          return {
            ...prevFilters,
            [field]: "", 
          };
        }
        return prevFilters;
      });
    }
  };
  
  const handleApprovalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      const fullApprovalNumber = getFullApprovalNumber();
      if (fullApprovalNumber.replace(/-/g, "").length === 24) {
        if (!filterTags.includes(fullApprovalNumber)) {
          setFilterTags((prevTags) => [...prevTags, fullApprovalNumber]);
        }
        setFilters({
          ...filters,
          approvalNumber1: "",
          approvalNumber2: "",
          approvalNumber3: "",
        });
      }
    }
  };
  
  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);

    const today = new Date();
    let newStartDate: Date | null = new Date(today); 

    switch (filter) {
      case "오늘":
        newStartDate = today;
        break;
      case "1주":
        newStartDate.setDate(today.getDate() - 7); 
        break;
      case "1개월":
        newStartDate.setMonth(today.getMonth() - 1); 
        break;
      case "3개월":
        newStartDate.setMonth(today.getMonth() - 3); 
        break;
      case "1년":
        newStartDate.setFullYear(today.getFullYear() - 1); 
        break;
    }

    setFilters((prev) => ({
      ...prev,
      startDate: newStartDate,
      endDate: today, 
    }));
};

  const handleReset = () => {
    setFilters({
      writer: "",
      supplier: "",
      recipient: "",
      approvalNumber1: "", 
      approvalNumber2: "", 
      approvalNumber3: "", 
      startDate: null,
      endDate: null,
    });
    setFilterTags([]); 
    setSelectedFilter("전체");
  };
  const handleClearField = (field: keyof typeof filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: "", 
    }));
  };
  const getFullApprovalNumber = () => {
    return `${filters.approvalNumber1}${filters.approvalNumber2}${filters.approvalNumber3}`;
  };
  
  
  
  return (
    <SearchContainer>
      <GlobalStyles />
      <SearchBox>
    <InputContainer>
  <Label>공급자 사업체명</Label>
  <Input
    type="text"
    name="supplier"
    placeholder="지점명을 입력하세요."
    value={filters.supplier}
    onChange={handleChange}
    onKeyDown={(e) => handleKeyDown(e, "supplier")}
  />
  {filters.supplier && (
    <ClearIcon src={cancelIcon} alt="Clear" onClick={() => handleClearField("supplier")} />
  )}
</InputContainer>
<InputContainer>
  <Label>공급받는자 사업체명</Label>
  <Input
    type="text"
    name="recipient"
    placeholder="대리점명 입력하세요."
    value={filters.recipient}
    onChange={handleChange}
    onKeyDown={(e) => handleKeyDown(e, "recipient")}
  />
  {filters.recipient && (
    <ClearIcon src={cancelIcon} alt="Clear" onClick={() => handleClearField("recipient")} />
  )}
</InputContainer>
<InputContainer>
  <Label>승인번호</Label>

  <InputWrapper>
    <InputApproval
      type="text"
      name="approvalNumber1"
      placeholder="12345678"
      value={filters.approvalNumber1}
      onChange={handleChange}
      onKeyDown={handleApprovalKeyDown}
      maxLength={8}
    />
  </InputWrapper>

  <InputWrapper>
    <InputApproval
      type="text"
      name="approvalNumber2"
      placeholder="12345678"
      value={filters.approvalNumber2}
      onChange={handleChange}
      onKeyDown={handleApprovalKeyDown}
      maxLength={8}
    />
  </InputWrapper>

  <InputWrapper>
    <InputApproval
      type="text"
      name="approvalNumber3"
      placeholder="12345678"
      value={filters.approvalNumber3}
      onChange={handleChange}
      onKeyDown={handleApprovalKeyDown}
      maxLength={8}
    />
  </InputWrapper>

  {(filters.approvalNumber1 || filters.approvalNumber2 || filters.approvalNumber3) && (
    <ClearIconApproval src={cancelIcon} alt="Clear" onClick={() => {
      setFilters({
        ...filters,
        approvalNumber1: "",
        approvalNumber2: "",
        approvalNumber3: "",
      });
    }} />
  )}
</InputContainer>
        <DateContainer>
          <DateLabel>기간</DateLabel>
          <DatePickerWrapper>
          <Icon src={calendar} alt="Calendar Icon" />
            <StyledDatePicker
              selected={filters.startDate}
              onChange={(date: Date) => setFilters({ ...filters, startDate: date })}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              calendarClassName="custom-calendar"
            />
          </DatePickerWrapper>
          <DateCheck> ~ </DateCheck>
          <DatePickerWrapper>
          <Icon src={calendar} alt="Calendar Icon" />
            <StyledDatePicker
              selected={filters.endDate}
              onChange={(date: Date) => setFilters({ ...filters, endDate: date })}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              calendarClassName="custom-calendar"
            />
          </DatePickerWrapper>
        </DateContainer>

        <ButtonContainer>
      {["오늘","1주","1개월","1년"].map((filter) => (
        <DateFilterButton
        key={filter}
        onClick={() => handleFilterClick(filter)}
        isSelected={selectedFilter === filter}
      >
        {filter}
      </DateFilterButton>
      ))}
    </ButtonContainer>
      </SearchBox>
      <CheckButtonContainer>
      <ResetButton onClick={handleReset}>
              <ResetIcon src={resetIcon} alt="초기화 아이콘" />
                초기화
          </ResetButton>
          <SearchButton onClick={() => userInfo && fetchSearchResults(userInfo)}>검색</SearchButton>
       </CheckButtonContainer>
       <ListContainer>
    <EmployeeListComponent data={searchResults} /></ListContainer>
    </SearchContainer>
  );
};

export default EmployeeSearchComponent;


const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const SearchBox = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  @media (max-width: 1104px) {
    padding: 12px;
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 12px;
  gap : 12px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  margin-right: 30px;
  width: 158px;
`;

const DateLabel = styled(Label)`
  margin-right: 30px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10.5px;
  border-radius: 4px;
  border: 1px solid #777;
  background: #FFF;
  font-size: 14px;
  min-width: 150px;
  &::placeholder {
    color: #777;
  }

  @media (max-width: 768px) {
    width: 30%; 
    font-size: 12px;
    padding: 8px;
  }

  @media (max-width: 480px) {
    width: 20%;
    font-size: 12px;
    padding: 6px;
  }
`;
const InputApproval = styled.input`
  flex: 1;
  padding: 10.5px;
  border-radius: 4px;
  border: 1px solid #777;
  background: #FFF;
  font-size: 14px;
  max-width: 98px;
  &::placeholder {
    color: #777;
  }

  @media (max-width: 768px) {
    width: 30%; 
    font-size: 12px;
    padding: 8px;
  }

  @media (max-width: 480px) {
    width: 20%;
    font-size: 12px;
    padding: 6px;
  }
`;


const DateContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  margin-top : 12px;
`;

const DatePickerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 140px;
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 10px 10px 10px 30px;
  border: 1px solid #777;
  border-radius: 4px;
  background: #FFF;
  font-size: 14px;
  cursor: pointer;
  width : 90px;
`;

const Icon = styled.img`
  position: absolute;
  left: 10px; 
  width: 18px;
  height: 18px;
  pointer-events: none;
  z-index: 1001;
`;

const DateCheck = styled.span`
  margin-left : 6px;
  margin-right : 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  margin-top :5px;
`;
const CheckButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  margin-top :5px;
  position :absolute;
  top : 600px;
  left : 670px;
  z-index : 1001;
`;

const DateFilterButton = styled.button<{ isSelected: boolean }>`
  padding: 10px 18px 30px 18px;
  height: 39px;
  border-radius: 8px;
  border: 1px solid #009857;
  background: ${({ isSelected }) => (isSelected ? "#009857" : "#FFF")};
  color: ${({ isSelected }) => (isSelected ? "white" : "#009857")};
  cursor: pointer;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  transition: background 0.2s, color 0.2s;
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 10px;
  }
`;

const SearchButton = styled.button`
  padding: 12px 32px;
  background: #009857;
  color: white;
  width: 112px;
 padding: 34px 40px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const GlobalStyles = createGlobalStyle`
      .custom-calendar {
    font-family: Pretendard, sans-serif;
  }
  .react-datepicker__day--selected {
    background-color: #009857 !important;
    color: white !important;
    border-radius: 50%;
    font-weight: bold !important;
  }


  .react-datepicker__day--today {
    color: #009857 !important;
    font-weight: bold;
  }

  .react-datepicker__day--today.react-datepicker__day--selected {
    color: white !important;
  }

  .react-datepicker__navigation {
    color: #009857 !important;
  }

  .react-datepicker__current-month {
    color: #009857 !important;
    font-weight: bold;
  }
`;
const ResetButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 76px;
  height : 90px;
  margin-right : 5px;
  margin-left : 5px;
  border-radius: 8px;
  border: 1px solid #009857;
  background: #FFF;
  color: #009857;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  margin -left : 200px;
`;

const ResetIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
`;

const ClearIcon = styled.img`
  position: absolute;
  right: 320px;
  width: 14px;
  height: 14px;
  cursor: pointer;
`;
const ClearIconApproval = styled.img`
  position: absolute;
  right: 485px;
  width: 14px;
  height: 14px;
  cursor: pointer;
`;
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 5px;
`;

const ListContainer = styled.div`
 margin-top : 100px;
`