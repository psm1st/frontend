import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import EmployeeLayout from "./EmployeeLayout";
import Dropdown from "@assets/icons/LayoutLogo.svg";
import PwToolTip from "@components/pwSetting/PwToolTip";

interface UserInfo {
  name: string;
  role: string;
  employeeId: string;
}


const HeaderLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <Container>
      <NotificationBar>
        <NotificationText>세금계산서 진위 확인 및 조회 웹사이트</NotificationText>
      </NotificationBar>
      <Header>
        <HeaderContent>
          <LogoContainer onClick={() => navigate("/home")}>
            <Logo src="/SeoulMilkLogoS.png" alt="서울우유협동조합" />
          </LogoContainer>
          <Nav>
            <NavItem onClick={() => navigate("/upload")} active={location.pathname === "/upload"}>
              세금계산서 업로드
            </NavItem>
            <NavItem onClick={() => navigate("/search")} active={location.pathname === "/search"}>
              세금계산서 조회
            </NavItem>
            <NavItem onClick={() => navigate("/announcement")} active={location.pathname === "/announcement"}>
              공지사항
            </NavItem>
          </Nav>
          <UserInfoContainer>
          {userInfo && (
            <UserInfo onClick={() => setIsModalOpen(true)}>
              {userInfo.name}님 ({userInfo.role === "ADMIN" ? "관리자" : "사원"})
              <UserLogo src={Dropdown} />
            </UserInfo>
          )}
          </UserInfoContainer>
        </HeaderContent>
      </Header>
      <PwToolTip />
      <Main>
        <Outlet />
      </Main>

      {isModalOpen && userInfo && (
        <ModalContainer ref={modalRef}>
          {userInfo.role === "ADMIN" ? (
            <AdminLayout
              name={userInfo.name}
              employeeId={userInfo.employeeId}
              onClose={() => setIsModalOpen(false)}
            />
          ) : (
            <EmployeeLayout
              name={userInfo.name}
              employeeId={userInfo.employeeId}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </ModalContainer>
      )}
    </Container>
  );
};

export default HeaderLayout;


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1440px;
  overflow-x: hidden;
`;

const NotificationBar = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  background: var(--primary-main-200, #009857);
  height: 26px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1015; 

  @media screen and (max-width: 1104px) {
    font-size: 10px;
  }
`;

const NotificationText = styled.div`
  width: 228px;
  color: var(--white, #FFF);
  text-align: center;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
 margin-right: 1100px;

  @media screen and (max-width: 1104px) {
    font-size: 10px;
  }
`;

const Header = styled.header`
  width: 100%;
  position: fixed;
  top: 26px;
  left: 0;
  display: flex;
  justify-content: center;
  background-color: white;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.25);
  z-index: 999; 
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: 1440px;
  min-width: 1104px;
  display: flex;
  align-items: center;
  justify-content: left;
  padding: 0 40px;

  @media screen and (max-width: 1280px) {
    padding: 0 24px;
  }
  @media screen and (max-width: 1104px) {
    padding: 0 16px;
  }
`;

const UserLogo = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const LogoContainer = styled.button`
  width: 200px;
  height: 43.456px;
  margin-top: 5px;
  margin-left: 50px;
  border: none;
  background: none;
  cursor: pointer;

  @media screen and (max-width: 1000px) {
    margin-left : 95px;
  }
  @media screen and (max-width: 900px) {
    margin-left : 130px;
  }
  @media screen and (max-width: 800px) {
    margin-left : 190px;
  }  
  @media screen and (max-width: 700px) {
    margin-left : 230px;
  }   
 @media screen and (max-width: 630px) {
    margin-left : 280px;
  } 
 @media screen and (max-width: 530px) {
    margin-left : 300px;
  }
  @media screen and (max-width: 490px) {
    margin-lef t : 330px;
  }  
`;

const Logo = styled.img`
  height: 32px;
  margin-right: 8px;
`;

const Nav = styled.nav`
  display: flex;
  color: var(--gray-1600, #393C3C);
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
  margin-right: 580px;
  margin-top : 5px;
  gap : 16px;
  @media screen and (max-width: 1000px) {
    margin-right : 95px;
  }
  @media screen and (max-width: 900px) {
    margin-right : 140px;
  }
  @media screen and (max-width: 800px) {
    margin-right : 190px;
  }  
  @media screen and (max-width: 700px) {
    margin-right : 230px;
  }   
 @media screen and (max-width: 630px) {
    margin-right : 280px;
  } 
 @media screen and (max-width: 530px) {
    margin-right : 300px;
  }
  @media screen and (max-width: 490px) {
    margin-right : 330px;
  }  
`;

const UserInfo = styled.span`
  display: flex;
  align-items: center; 
  cursor: pointer;

  @media screen and (max-width: 768px) {
    font-size: 14px;
  }

  @media screen and (max-width: 480px) {
    font-size: 12px;
  }
`;

const Main = styled.main`
  width: 100%;
  margin-left : 50px;
  min-width: 1440px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  
  min-height: 100vh; 

  margin-top: 110px;

  @media screen and (max-width: 768px) {
    margin-top: 90px;
    padding: 8px;
  }

  @media screen and (max-width: 480px) {
    margin-top: 70px;
    padding: 4px;
  }
`;


const ModalContainer = styled.div`
`;

const NavItem = styled.span<{ active: boolean }>`
  cursor: pointer;
font-family: Pretendard;
font-size: 14px;
font-style: normal;
  color: ${({ active }) => (active ? "#393C3C" : "#898989")};
  font-weight: ${({ active }) => (active ? "700" : "500")};
  &:hover {
    color: #393C3C;
  }
`;
const UserInfoContainer = styled.div`
color: var(--gray-1600, #393C3C);
font-family: Pretendard;
font-size: 14px;
font-style: normal;
font-weight: 600;
line-height: normal;
margin-top : 5px;
`