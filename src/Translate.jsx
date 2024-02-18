import React, { useState, useEffect, useCallback } from 'react';
import languageCodes from './Countries.js';

const Translate = () => {
    const [sourceLanguage, setSourceLanguage] = useState("en-US");
    const [targetLanguage, setTargetLanguage] = useState("hi-IN");
    const [setInput, setSetInput] = useState('');
    const [getInput, setGetInput] = useState("");
    const [placeholder,setPlaceHolder] = useState(false);


    const handleSourceLanguageChange = (event) => {
        setSourceLanguage(event.target.value);
    };

    const handleTargetLanguageChange = (event) => {
        setTargetLanguage(event.target.value);
    };

    const handleSearch = useCallback((value) => {
        if(value.length >= 500){
            setSetInput("Please enter only 500 characters...")
        }
        if (value.trim() !== "" && value.length < 500) {
            setPlaceHolder(true)
            setGetInput(value);
            let apiUrl = `https://api.mymemory.translated.net/get?q=${value}&langpair=${sourceLanguage}|${targetLanguage}`;
            fetch(apiUrl)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                .then((data) => {
                    setPlaceHolder(false)
                    if (data && data.responseData && data.responseData.translatedText) {
                        setSetInput(data.responseData.translatedText);
                    } else {
                        console.error('Translation not found');
                    }
                })
                .catch((error) => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    }, [sourceLanguage, targetLanguage]);

    useEffect(() => {
        handleSearch(getInput);
    }, [targetLanguage, getInput, handleSearch]);

    const handleCopy = (event) => {
        const className = event.target.className;
        if (className.includes("exampleFormControlTextarea1")) {
            navigator.clipboard.writeText(getInput);
        } else {
            navigator.clipboard.writeText(setInput);
        }
    };

    const handleVolume = (event) => {
        console.log(event.target.className)
        const textToSpeak = event.target.className.includes("exampleFormControlTextarea1") ? getInput : setInput;
        const languageToSpeak = event.target.className.includes("exampleFormControlTextarea1") ? sourceLanguage : targetLanguage;
        if (textToSpeak) {
            let speechSynthesis = window.speechSynthesis;
            let utterance = new SpeechSynthesisUtterance();
            utterance.text = textToSpeak;
            utterance.lang = languageToSpeak;
            speechSynthesis.speak(utterance);
        } else {
            let speechSynthesis = window.speechSynthesis;
            let utterance = new SpeechSynthesisUtterance();
            utterance.text = languageToSpeak === sourceLanguage ? "Please enter some text" : "कृपया कुछ लिखें";
            utterance.lang = languageToSpeak;
            speechSynthesis.speak(utterance);
        }
    };


    const translateByVoice = () => {
        let speechSynthesis = window.speechSynthesis;
        let utterance = new SpeechSynthesisUtterance();
        utterance.text = "Speak";
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
        const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
        recognition.lang = sourceLanguage;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        setPlaceHolder(true)
        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    const transcript = event.results[i][0].transcript;
                    setGetInput(transcript)
                } else {
                    const interimTranscript = event.results[i][0].transcript;
                    console.log('Interim result:', interimTranscript);
                }
            }
        };
        // recognition.onend = () => {
        //     // Recognition ended, you can perform any actions here
        // };
        recognition.onerror = (event) => {
            console.error('Error occurred in recognition:', event.error);
        };
        // Start listening for speech
        recognition.start();
    };
    

    const handleExchangeLanguages = () => {
        const tempSourceLanguage = sourceLanguage;
        const tempTargetLanguage = targetLanguage;

        setSourceLanguage(tempTargetLanguage);
        setTargetLanguage(tempSourceLanguage);

        const tempInput = getInput;
        setGetInput(setInput);
        setSetInput(tempInput);
    };

    return (
        <div>
            <h5 className="roboto-bold mt-5"><span className='alert alert-success '>Translation Application</span></h5>
            <div className='container mt-5'>
                <div className='row'>
                    <div className='col-lg-5 col-md-5 col-sm-12'>
                        <div className="form-group">
                            <select
                                className="form-select select-box"
                                aria-label="Select source language"
                                value={sourceLanguage}
                                onChange={handleSourceLanguageChange}
                            >
                                {Object.entries(languageCodes).map(([code, language]) => (
                                    <option key={code} value={code}>{language}</option>
                                ))}
                            </select>
                            <textarea
                                className="form-control"
                                id="exampleFormControlTextarea1"
                                rows="8"
                                value={getInput}
                                placeholder={placeholder?'Please wait..':'Enter your input...'}
                                onChange={(e) => setGetInput(e.target.value)} 
                                style={{ overflow: 'auto', resize: 'none' }}
                            ></textarea>

                        </div>
                        <div className='icons'>
                            <i className="fa-solid fa-microphone mx-3" title="Translate by voice" onClick={translateByVoice}></i>
                            <i className="fa-solid fa-copy exampleFormControlTextarea1 mx-3" title='copy' onClick={handleCopy}></i>
                            <i className="fa-solid fa-volume-high exampleFormControlTextarea1 mx-3" title='sound' onClick={handleVolume}></i>
                        </div>
                    </div>
                    <div className='col-lg-2 col-md-2 col-sm-12'>
                        <i className="fa-solid fa-arrow-right-arrow-left exchangeBtn mb-4" title='exchange languages' onClick={handleExchangeLanguages}></i>
                    </div>
                    <div className='col-lg-5 col-md-5 col-sm-12 '>
                        <div className="form-group">
                            <select
                                className="form-select select-box"
                                aria-label="Select target language"
                                value={targetLanguage}
                                onChange={handleTargetLanguageChange}
                            >
                                {Object.entries(languageCodes).map(([code, language]) => (
                                    <option key={code} value={code}>{language}</option>
                                ))}
                            </select>
                            <textarea
                                className="form-control"
                                id="exampleFormControlTextarea2"
                                rows="8"
                                value={setInput}
                                placeholder={placeholder?"in progress...":"Translated text here..."}
                                readOnly
                                style={{ overflow: 'auto', resize: 'none' }}
                            ></textarea>
                        </div>
                        <div className='icons'>
                            <i className="fa-solid fa-copy exampleFormControlTextarea2 mx-3" title='copy' onClick={handleCopy}></i>
                            <i className="fa-solid fa-volume-high exampleFormControlTextarea2 mx-3" title='sound' onClick={handleVolume} ></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Translate;
