import React, { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TextField, Button } from '@mui/material';
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function Contactus() {
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const showToastMessage = (success) => {
    if (success) {
      toast.success("Successfully Message Sent!", {});
    } else {
      toast.error("Some Field Required Here!", {});
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setError("");

    if (!recipient || !subject || !message) {
      showToastMessage(false);
      return;
    }

    const url = "http://localhost:3333/ifl_system/adminCase/mailing";

    try {
      const response = await axios.post(url, { email: recipient, subject, message });
      if (response.status === 201) {
        setRecipient('');
        setSubject('');
        setMessage('');
        showToastMessage(true);
      } else {
        setError(response.data.error || "An error occurred while sending the email.");
        showToastMessage(false);
      }
    } catch (error) {
      setError("An error occurred while sending the email.");
      showToastMessage(false);
    }
  };

  return (
    <>

      <main>
        <div className=' w-full p-8'>
          <div className='text-3xl'>Contact us</div>
          
          <div className='col-span-2 p-5 mt-10 rounded flex bg-slate-200'>
            <div className='flex-grow'>
              <div className='mb-4 text-xl font-semibold'>Write New Message</div>
              <div className='my-2'>
                <label htmlFor='recipient'>Your Email:</label>
                <TextField 
                  id='recipient' 
                  variant='outlined' 
                  className='w-full my-2' 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div className='my-2'>
                <label htmlFor='subject'>Subject:</label>
                <TextField 
                  id='subject' 
                  variant='outlined' 
                  className='w-full my-2' 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className='my-2'>
                <label htmlFor='message'>Message:</label>
                <TextField
                  id='message'
                  multiline
                  rows={5}
                  variant='outlined'
                  className='w-full my-2'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className='flex justify-center my-7 gap-5 lg:justify-end'>
            <Button
              variant="contained"
              color="warning"
              onClick={sendEmail}
            >
              Send
            </Button>
            <Button variant="contained" color="primary">
              Cancel
            </Button>
          </div>
          <ToastContainer />
        </div>
      </main>
    </>
  );
}
