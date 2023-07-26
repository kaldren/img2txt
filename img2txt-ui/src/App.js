import React, { useRef, useState } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import axios from 'axios';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
`;

const Header = styled.h1`
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const StyledButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1.2em;
  font-weight: bold;
  background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
  border-radius: 20px;
  &:hover {
    background: linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%);
  }
  &:disabled {
    cursor: not-allowed;
    background-color: #cccccc;
  }
`;

const StyledFilePond = styled(FilePond)`
  min-width: 400px; 
  .filepond--root {
    background-color: #FFFFFF;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
  }
`;


export default function App() {
  const pond = useRef();

  const date = new Date();
  const randomString = Math.random().toString(36).substring(2, 15);
  const folderName = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}_${randomString}`;
  const serverEndpoint = `http://127.0.0.1:5000/api/upload_image/${folderName}`

  const [processing, setProcessing] = useState(false);

  const uploadFiles = () => {
    if (pond.current) {
      pond.current.processFiles();
    }
  }

  const handleProcessFile = (error, file) => {
    if (error) {
      console.log('Oh no', error);
      return;
    }

    console.log('File processed:', file);

    if (pond.current.getFiles().every(file => file.status === 5)) {
      console.log('All files have been processed');

      setProcessing(true);

      axios.get(`http://127.0.0.1:5000/api/create_zip/${folderName}`)
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  }

  const handleAddFile = (fileItem) => {
    const fileType = fileItem.fileType;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(fileType)) {
      toast.error('Please upload only images (jpeg, png, jpg, gif).');
      return false;
    }
    return true;
  };
  

  return (
    <Container>
      <ToastContainer />
      <Header>Upload your images and we'll convert them to text</Header>
      <StyledFilePond
        ref={pond}
        instantUpload={false}
        allowMultiple={true}
        allowProcess={false}
        allowRevert={false}
        maxParallelUploads={1} 
        server={serverEndpoint}
        onprocessfile={handleProcessFile}
        beforeAddFile={handleAddFile}
      />

      <StyledButton onClick={uploadFiles} disabled={processing}>
        {processing ? 'Processing...' : 'Upload Files'}
      </StyledButton>
    </Container>
  );
}
