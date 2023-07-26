import React, { useRef, useState } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import axios from 'axios';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Modal from 'react-modal';
import Joyride, { STATUS } from 'react-joyride';

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
  padding: 15px 30px; // Increased padding
  font-size: 1.4em; // Increased font size
  font-weight: bold;
  background: #1e90ff; // Bright Blue color
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  border-radius: 20px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  &:hover {
    transform: scale(1.1); // Scales up the button on hover
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
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

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '15px',
    padding: '20px',
    width: '50%', // adjust this as needed
    background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    width: '500px',
    maxWidth: '100%',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    zIndex: 1000,
  },
};

const LanguageOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

const LanguageImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const LanguageName = styled.div`
  margin-top: 10px;
  text-align: center;
  font-size: 1.2em;
  color: #ffffff; // Changed text color to white for better contrast
  font-weight: bold;
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); // Text shadow for better legibility
`;

const LanguageDisplay = styled.div`
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #ffffff; // Changed text color to white for better contrast
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); // Text shadow for better legibility
`;

const uploadModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '15px',
    padding: '20px',
    background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    width: '500px',
    maxWidth: '100%',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
};


const UploadButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1.2em;
  font-weight: bold;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
  border-radius: 20px;
  &:hover {
    background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
  }
`;

const CancelButton = styled.button`
  background-color: #f44336; /* Red */
  color: white;
  padding: 10px 24px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
  border-radius: 12px;
  &:hover {
    background-color: #da190b;
    color: white;
  }
`;

const ConfirmButton = styled.button`
  background-color: #4CAF50; /* Green */
  color: white;
  padding: 10px 24px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
  border-radius: 12px;
  &:hover {
    background-color: #45a049;
    color: white;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
`;

const LanguageButton = styled.button`
  margin: 10px;
  padding: 0;
  border: none;
  background: none;
`

export default function App() {
  const pond = useRef();

  const date = new Date();
  const randomString = Math.random().toString(36).substring(2, 15);
  const folderName = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}_${randomString}`;
  const serverEndpoint = `http://127.0.0.1:5000/api/upload_image/${folderName}`

  const [processing, setProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [chosenLanguage, setChosenLanguage] = useState('English'); // Initial
  const [joyrideRun, setJoyrideRun] = useState(true);
  
  const joyrideSteps = [
    {
      target: ".language-display",
      content: "Change your document language from here",
      event: 'load', // try adding this to trigger on load
      disableBeacon: true, 
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, action } = data;
    console.log("Joyride callback:", status, action);
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setJoyrideRun(false);
    }
  };

  const setUploadModalOpen = () => {
    setIsUploadModalOpen(true);
  }
  
  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  }
  


  const openModal = () => {
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleUploadModalClose = () => {
    setUploadModalOpen(false);
  };

  const handleUploadModalContinue = () => {
    uploadFiles();
    setUploadModalOpen(false);
  };

  const handleLanguageChange = (languageCode, languageName) => {
    setLanguage(languageCode);
    setChosenLanguage(languageName);
    closeModal();
  };

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
  
  const uploadFiles = () => {
    if (pond.current) {
      pond.current.processFiles();
    }
  }

  return (
    <Container>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Choose the language on your images"
      >
        <Title>What is the language?</Title>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <LanguageOption onClick={() => handleLanguageChange('en', 'English')}>
            <LanguageImage src="/assets/img/en.png" alt="English" />
            <LanguageName>English</LanguageName>
          </LanguageOption>
          <LanguageOption onClick={() => handleLanguageChange('bg', 'Bulgarian')}>
            <LanguageImage src="/assets/img/bg.png" alt="Bulgarian" />
            <LanguageName>Bulgarian</LanguageName>
          </LanguageOption>
        </div>
      </Modal>


      <Modal
  isOpen={isUploadModalOpen}
  onRequestClose={closeUploadModal}
  style={uploadModalStyles}
  contentLabel="Upload Modal"
>
  <Title>Upload your images</Title>
  <p>We're about to extract the text from the images in {chosenLanguage}</p>
  <LanguageButton onClick={openModal}>
    <img src={`/assets/img/${language}.png`} alt={chosenLanguage} width="30" height="30" />
  </LanguageButton>
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <ConfirmButton onClick={uploadFiles}>Continue</ConfirmButton>
    <CancelButton onClick={closeUploadModal}>Cancel</CancelButton>
  </div>
</Modal>




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

      <StyledButton onClick={handleUploadClick} disabled={processing}>
        {processing ? 'Processing...' : 'Upload Files'}
      </StyledButton>
      <LanguageDisplay className="language-display">
      <button onClick={openModal}>
        <img src={`/assets/img/${language}.png`} alt={chosenLanguage} width="30" height="30" />
      </button>
    </LanguageDisplay>
    <Joyride
      steps={joyrideSteps}
      run={joyrideRun}
      continuous={true}
      showProgress={true}
      disableBeacon={true} // Add this line
      callback={handleJoyrideCallback}
    />

    </Container>
  );
}
