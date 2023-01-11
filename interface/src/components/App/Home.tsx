import { Button, Icon } from '@mui/material';
import React, { useState } from 'react';
import compose from '../../photos/icons/home/compose.svg';
import inbox from '../../photos/icons/home/inbox.svg';
import star from '../../photos/icons/home/star.svg';
import send from '../../photos/icons/home/send.svg';
import robot from '../../photos/icons/home/robot.svg';
import contact from '../../photos/icons/home/contact.svg';
import github from '../../photos/icons/home/github.svg';
import discord from '../../photos/icons/home/discord.svg';
import '../../componentsStyling/home.scss';
import ContactsSetter from '../ContactsSetter';

export function Home(props: any) {
    const [selectedIndex, setSelectedIndex] = useState<any>(4);
    const [show, setShow] = useState(false);

    function navigateTo(text: any, index: any) {
        setSelectedIndex(index)
        props.onChange(text)
        if(index !== 0)
            localStorage.removeItem('input')
    }
    
    return (
        <div className="content-box home">
            <div className="heading mt-3">
                <h4>Welcome to deb0x</h4>
                <p>Let's show you around our app</p>
            </div>
            <div className="tiles-container">
                <div className="row">
                    <div className="col-3 tile">
                        <div className="tile-content">
                            <p>Start writing your messages using</p>
                            <Button className="compose"
                                onClick={() => navigateTo("Compose", 0)} 
                                startIcon={
                                <Icon>
                                    <img alt="compose" src={compose} />
                                </Icon>
                            }>
                                Compose
                            </Button>
                        </div>
                    </div>
                    <div className="col-3 tile">
                        <div className="tile-content">
                            <p>Check received messages in</p>
                            <Button className="inbox"
                                onClick={() => navigateTo("Deb0x", 1)} 
                                startIcon={
                                    <Icon>
                                        <img alt="inbox" src={inbox} />
                                    </Icon>
                            }>
                            Your Deb0x
                            </Button>
                        </div>
                        
                    </div>
                    <div className="col-3 tile">
                        <div className="tile-content">
                            <p>Have a look at your Fees & Rewards using</p>
                            <Button className="stake"
                                onClick={() => navigateTo("Stake", 2)}  
                                startIcon={
                                    <Icon>
                                        <img alt="stake" src={star} />
                                    </Icon>
                            }>
                                DBX
                            </Button>
                        </div>
                    </div>
                    <div className="col-3 tile">
                        <div className="tile-content">
                            <p>Check sent emails in</p>
                            <Button className="sent"
                                onClick={() => navigateTo("Sent", 3)}
                                startIcon={
                                    <Icon>
                                        <img alt="sent" src={send} />
                                    </Icon>
                            }>
                                Sent
                            </Button>
                        </div>
                    </div>
                    <div className="col-3 tile">
                        <div className="tile-content">
                            <p>Get in touch with us</p>
                            <Button className="robot" 
                                startIcon={
                                    <Icon>
                                        <img alt="robot" src={robot} />
                                    </Icon>     
                            }>
                                deb0x bot
                            </Button>
                        </div>
                    </div>
                    <div className="col-3 tile">
                        <div className="tile-content">
                            <p>Store your favorite addresses in the</p>
                            <Button className="contact"
                                onClick={() => setShow(true)}
                                startIcon={
                                    <Icon>
                                        <img alt="contact" src={contact} />
                                    </Icon>
                            }>
                                Contacts
                            </Button>
                            {show ? 
                                <ContactsSetter show={show} onClickOutside={() => setShow(false)}/> : 
                                <></>
                            }
                        </div>
                    </div>
                    <div className="col-3 tile">
                        <div className="tile-content">
                            <p>Have a look at our</p>
                            <a href="https://github.com/deb0x/deb0x-faberweb3" target="_blank" className='logo-text-color'>
                                <Button className="github" 
                                    startIcon={
                                        <Icon>
                                            <img alt="github" src={github} />
                                        </Icon>         
                                }>
                                    GitHub
                                </Button>
                            </a>
                        </div>
                    </div>
                    <div className="col-3 tile">
                        <div className="tile-content">
                            <p>Get in touch with the dev community on</p>
                            <a href="http://discord.gg/btejt3kUcN" target="_blank" className='logo-text-color'>
                                <Button className="discord" 
                                    startIcon={
                                    <Icon>
                                        <img alt="discord" src={discord} />
                                    </Icon> 
                                }>
                                    Discord
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="home-bottom">
                <p className="mb-0 mt-4">
                    Have a look at our official publications on 
                    <a href="https://github.com/deb0x" target="_blank" className='logo-text-color ml-2'>
                        Mirror
                    </a>
                    .
                    </p>
                <p>
                    For latest news & updates follow us on 
                    <a href="https://twitter.com/deb0xDAO" target="_blank" className='logo-text-color ml-2'>
                    Twitter
                    </a>
                    .
                </p>
            </div>
            
        </div>
    )
}