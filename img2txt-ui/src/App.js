import React, { useRef, useState } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #F0F0F0;
`;

const StyledButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1.2em;
  background-color: #FF7F50;
  border: none;
  color: white;
  cursor: pointer;
  transition-duration: 0.4s;
  border-radius: 20px;  // Rounded corners
  &:hover {
    background-color: #008B8B; // Dark Cyan color on hover
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
    // Validate file type
    const fileType = fileItem.fileType; 
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(fileType)) {
      // If not an image, return false to prevent file from being added
      alert('Please upload only images (jpeg, png, jpg, gif).');
      return false;
    }
    return true;
  }

  return (
    <Container>
      <StyledFilePond
        ref={pond}
        instantUpload={false}
        allowMultiple={true}
        allowProcess={false}
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
