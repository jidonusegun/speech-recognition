import React, { useRef, useState} from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import axios from 'axios';

const SpeechToText = () => {

    const speechRecognitionSupported =
  SpeechRecognition.browserSupportsSpeechRecognition();
    
    const { transcript, resetTranscript } = useSpeechRecognition();
    const [listening, setListening] = useState(false);
    const textBodyRef = useRef(null);
    
    const [response, setResponse] = useState({
        loading: false,
        message: "",
        error: false,
        success: false,
      });

    const startListening = () => {
        setListening(true)
        SpeechRecognition.startListening({
            continuous: true
        })
    }

    const stopListening = () => {
        setListening(false);
        SpeechRecognition.stopListening();
    }

    const resetText = () => {
        SpeechRecognition.stopListening();
        resetTranscript();
        textBodyRef.current.innerText = "";
    }

    const handleConversion = async() => {
        if (typeof window !== "undefined") {
            const userText = textBodyRef.current.innerText;
              // console.log(textBodyRef.current.innerText);
            
            if (!userText) {
                alert("Please speak or write some text.");
                return;
            }

            try {
                setResponse({
                    ...response,
                    loading: true,
                    message: "",
                    error: false,
                    success: false,
                });
                const config = {
                    headers: {
                      "Content-Type": "application/json",
                    },
                    responseType: "blob",
                };
                  
                const res = await axios.post(
                    "https://serene-badlands-85830.herokuapp.com/",
                    {
                      text: textBodyRef.current.innerText,
                    },
                    config
                );

                setResponse({
                    ...response,
                    loading: false,
                    error: false,
                    message:
                      "Conversion was successful. Your download will start soon...",
                    success: true,
                });
                  
                // convert the received data to a file
                const url = window.URL.createObjectURL(new Blob([res.data]));
                // create an anchor element
                const link = document.createElement("a");
                // set the href of the created anchor element
                link.href = url;
                // add the download attribute, give the downloaded file a name
                link.setAttribute("download", "convertedFile.pdf");
                // add the created anchor tag to the DOM
                document.body.appendChild(link);
                // force a click on the link to start a simulated download
                link.click();

            } catch(error){
              setResponse({
                ...response,
                loading: false,
                error: true,
                message:
                  "An unexpected error occurred. Text not converted. Please try again",
                success: false,
              });
            }
        }
    }

    if(!speechRecognitionSupported) {
        return <div>Your browser does not support speech recognition</div>
    }

  return (
    <>
      <section>
        <div className="button-container">
          <button 
            type="button"
            onClick={startListening}
            style={{ "--bgColor": "blue" }}
            disabled={listening}
          >
            Start
          </button>
          <button 
            type="button" 
            onClick={stopListening}
            style={{ "--bgColor": "orange" }}
            disabled={listening === false}
          >
            Stop
          </button>
        </div>
        <div
          className="words"
          contentEditable
          ref={textBodyRef}
          suppressContentEditableWarning={true}
        >
            {transcript}
        </div>
        <div>
            {response.success && <i className="success">{response.message}</i>}
            {response.error && <i className="error">{response.message}</i>}
        </div>
        <div className="button-container">
          <button 
            type="button" 
            onClick={resetText}
            style={{ "--bgColor": "red" }}
          >
            Reset
          </button>
          <button 
            type="button" 
            style={{ "--bgColor": "green" }}
            onClick={handleConversion}
          >
            Convert to pdf
          </button>
        </div>
      </section>
    </>
  );
};

export default SpeechToText;