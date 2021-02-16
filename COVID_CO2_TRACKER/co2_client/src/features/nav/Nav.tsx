import React, {FunctionComponent, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Link, Redirect} from 'react-router-dom';
import NavItem from 'react-bootstrap/NavItem';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { LinkContainer } from 'react-router-bootstrap';

import {Login, LoginFormType} from '../login/Login';
import {Logout} from '../login/Logout';

// import {HomePage} from '../home/HomePage';
import {selectUsername, setUsername} from '../login/loginSlice';

import {get_email} from '../../utils/Authentication';

type NavBarProps = {
}


const renderLoginSignup = (): JSX.Element => 
<>
    <LinkContainer to='login'>
        <NavItem className='nav-item'>Login</NavItem>                
    </LinkContainer>

    <LinkContainer to='signup'>
        <NavItem className='nav-item'>Signup</NavItem>                
    </LinkContainer>
</>


const loggedIn = (username: string) =>
  <NavDropdown title={`You're logged in as ${username}!`} id="basic-nav-dropdown">
    <NavDropdown.Item>
        <LinkContainer to='/profile'>
            <NavItem className='nav-item'>{username}'s profile</NavItem>
        </LinkContainer>
    </NavDropdown.Item>
    <NavDropdown.Item>
        <Logout/>
    </NavDropdown.Item>
  </NavDropdown>

function loginOrSignupMaybe(username: string): JSX.Element {
  if (username === '') {
    console.log("no username, rendering login/signup options")
    return renderLoginSignup();
  }
  console.log("logged in, rendering profile and logout")
  return loggedIn(username);
}


/*
      <Navbar>
        <Nav>
          <Navbar.Collapse className="justify-content-end" id="basic-navbar-nav">
          </Navbar.Collapse>
        </Nav>
      </Navbar>

*/

interface UserNavProps {
    username: string
}

// const profileIfLoggedIn = (username: string): JSX.Element => {
//     if (username === '') {
//         console.log("not logged in, not rendering profile tab");
//         return (<></>);
//     }

//     return (
//         <LinkContainer to='/profile'>
//             <NavItem className='nav-item'>{username}'s profile</NavItem>
//         </LinkContainer>
//     )
// }

const UserNav: React.FC<UserNavProps> = ({username}) =>
    <Navbar expand="lg" /*bg="dark" variant="dark"*/>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav"/> */}
        {/* <Navbar.Collapse  id="basic-navbar-nav"> */}
            <Nav className="justify-content-left" variant="tabs">
                <LinkContainer to='/home'>
                    <NavItem className='nav-item'>Home</NavItem>
                </LinkContainer>
                <LinkContainer to='/devices'>
                    <NavItem className='nav-item'>Devices</NavItem>
                </LinkContainer>

            </Nav>
            <Nav className="justify-content-end" variant="tabs">
                {/* {profileIfLoggedIn(username)} */}
                <Nav.Link href="https://github.com/ariccio/COVID-CO2-tracker">Github/sponsor</Nav.Link>
                {loginOrSignupMaybe(username)}
                {/* <LinkContainer to='/logout'><NavItem className='nav-item'>Logout {props.username}</NavItem></LinkContainer> */}
                {/* <NavItem className='nav-item' pullRight>{props.username}</NavItem> */}
            </Nav>
        {/* </Navbar.Collapse> */}
    </Navbar>


export const NavBar: React.FC<NavBarProps> = (props: NavBarProps) => {
    const username = useSelector(selectUsername);
    const dispatch = useDispatch();
    useEffect(() => {
      const emailPromise = get_email();
      emailPromise.then(email => {
        if (email.errors === undefined){
          if (email.email === undefined) {
            alert("undefined response from server. Likely internal server error getting username!");
            debugger;
          }
          console.log("got email: ", email.email)
          dispatch(setUsername(email.email));
        }
      })
    }, [dispatch]);
  
    console.log(`Current username: ${username}`)
    return <UserNav username={username}/>;
}
