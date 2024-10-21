import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import './Header.css'; // Ensure this CSS file is properly linked
import { Drawer, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navbar, Nav, Form, FormControl, Button, Modal, Tab, Nav as BootstrapNav } from 'react-bootstrap';
import { FaSearch, FaFilter, FaUser } from 'react-icons/fa';
import './Header.css'; // Ensure this CSS file is properly linked
import { useUser } from './UserContext';

const Header = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [profilePic, setProfilePic] = useState(null);
    const [username, setUsername] = useState('User Name');
    const [email, setEmail] = useState('user@example.com');
    const { user } = useUser();
    const navigate = useNavigate();


    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchTerm);
        setSearchTerm('');
    };

    const handleFileChange = (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        console.log('Profile updated:', { username, email, profilePic });
        handleClose();
    };
    return (
        <>
            <Navbar bg="light" expand="lg" className="mb-4 shadow-sm px-3">
                {/* Brand on the left */}
                <Navbar.Brand as={Link} to="/" className="font-weight-bold text-indigo">
                    LawFirm
                </Navbar.Brand>

                {/* Navigation items visible on larger screens */}
                <Nav className="ml-auto d-none d-lg-flex flex items-center gap-1">
                    <Nav.Link onClick={handleShow} className="text-indigo m-0" aria-label="User Options">
                        <FaUser size={20} />
                    </Nav.Link>

                </Nav>

                {/* Hamburger menu visible on smaller screens */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={open} className="d-lg-none ml-auto">
                    <FaBars size={24} />
                </Navbar.Toggle>

                {/* Drawer (opens when hamburger is clicked) */}
                <Drawer opened={opened} onClose={close} styles={{
                    inner: {
                        width: '60%'
                    }
                }}>
                    <Nav className="flex-column flex flex-col">
                        <Form inline className="!flex !flex-col" onSubmit={handleSearch}>
                            {/* <FaSearch className="mr-2 text-indigo" />
                            <FormControl
                                type="text"
                                placeholder="Search"
                                className="mr-sm-2 custom-search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            /> */}
                            <TextInput leftSection={<FaSearch />} rightSection={<FaFilter />} />
                            {/* <Button type="submit" variant="outline-indigo" className="ml-2 custom-button">
                                <FaFilter />
                            </Button> */}
                        </Form>

                        {/* drawer */}
                        <Nav className="flex items-start gap-1 w-full">
                            <Nav.Link as={Link} to="/" className="text-indigo m-0">Dashboard</Nav.Link>
                            <Nav.Link onClick={handleShow} className="text-indigo m-0" aria-label="User Options">
                                <FaUser size={20} />
                            </Nav.Link>
                        </Nav>
                    </Nav>
                </Drawer>
            </Navbar>

            {/* User Profile Modal */}
            <Modal show={showModal} onHide={handleClose} className="luxury-modal">
                <Modal.Header closeButton>
                    <Modal.Title className="text-indigo">User Options</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tab.Container id="user-options-tabs" activeKey={activeTab}>
                        <BootstrapNav variant="tabs">
                            <BootstrapNav.Item>
                                <BootstrapNav.Link eventKey="profile" onClick={() => setActiveTab('profile')}>
                                    Profile
                                </BootstrapNav.Link>
                            </BootstrapNav.Item>
                            <BootstrapNav.Item>
                                <BootstrapNav.Link eventKey="settings" onClick={() => setActiveTab('settings')}>
                                    Settings
                                </BootstrapNav.Link>
                            </BootstrapNav.Item>
                            <BootstrapNav.Item>
                                <BootstrapNav.Link eventKey="logout" onClick={() => setActiveTab('logout')}>
                                    Logout
                                </BootstrapNav.Link>
                            </BootstrapNav.Item>
                        </BootstrapNav>
                        <Tab.Content className="mt-3">
                            <Tab.Pane eventKey="profile">
                                <div className="text-center">
                                    <img
                                        src={profilePic || 'https://via.placeholder.com/100'}
                                        alt="User Profile"
                                        className="rounded-circle mb-3"
                                        width="100"
                                        height="100"
                                    />
                                    <h5>{username}</h5>
                                    <p>Email: {user?.email}</p>
                                </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey="settings">
                                <Form onSubmit={handleProfileSubmit}>
                                    <Form.Group controlId="formProfilePic">
                                        <Form.Label>Profile Picture</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formEmail">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Save Changes
                                    </Button>
                                </Form>
                            </Tab.Pane>
                            <Tab.Pane eventKey="logout">
                                <p>Are you sure you want to log out?</p>
                                <Button variant="danger" onClick={() => {
                                    handleClose();
                                    navigate('/signin')
                                }}>
                                    Logout
                                </Button>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Header;
