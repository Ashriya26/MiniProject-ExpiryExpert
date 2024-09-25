import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import { useSpeechRecognition } from "react-speech-recognition";

const ProductForm = ({ categories, onSubmit, editProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [ocrTarget, setOcrTarget] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (editProduct) {
      setSelectedCategory(editProduct.category);
      setProductName(editProduct.name);
      setExpiryDate(editProduct.expiryDate);
      setText(editProduct.text);
    }
  }, [editProduct]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      processImage(file, ocrTarget);
    }
  };

  const processImage = (image, target) => {
    Tesseract.recognize(image, "eng", { logger: (m) => console.log(m) }).then(
      ({ data: { text } }) => {
        if (target === "name") {
          setProductName(text);
        } else if (target === "date") {
          setExpiryDate(text);
        }
        setIsCameraOpen(false);
      }
    );
  };

  const handleCaptureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      processImage(blob, ocrTarget);
    });
  };

  const openCamera = (target) => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    });
    setIsCameraOpen(true);
    setOcrTarget(target);
  };

  const handleStopListening = () => {
    stopListening();
    if (ocrTarget === "name") {
      setProductName(transcript);
    } else if (ocrTarget === "date") {
      setExpiryDate(transcript);
    }
    resetTranscript();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert("Category is required");
      return;
    }
    if (!productName) {
      alert("Product Name is required");
      return;
    }
    if (!expiryDate) {
      alert("Expiry Date is required");
      return;
    }

    const product = {
      id: editProduct ? editProduct.id : Date.now(),
      category: selectedCategory,
      name: productName,
      expiryDate,
      image,
      text,
    };
    saveProductToLocalStorage(product);
    onSubmit(product);
  };

  const saveProductToLocalStorage = (product) => {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter((p) => p.id !== product.id);
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
  };

  // Filter out "Expired" from the categories list
  const filteredCategories = categories.filter((category) => category !== "Expired");

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-column">
        <label>
          Category:
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Select Category</option>
            {filteredCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </label>
        <button type="button" onClick={() => openCamera("name")}>
          Open Camera for Product Name
        </button>

        <label>
          Expiry Date:
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </label>
        <button type="button" onClick={() => openCamera("date")}>
          Open Camera for Expiry Date
        </button>

        {isCameraOpen && (
          <div className="camera-container">
            <video ref={videoRef} width="320" height="240" />
            <button type="button" onClick={handleCaptureImage}>
              Capture Image
            </button>
            <canvas
              ref={canvasRef}
              width="320"
              height="240"
              style={{ display: "none" }}
            />
          </div>
        )}

        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        <button type="button" onClick={startListening}>
          Start Listening
        </button>
        <button type="button" onClick={handleStopListening}>
          Stop Listening
        </button>

        <label>
          Text from image:
          <textarea value={text} onChange={(e) => setText(e.target.value)} />
        </label>

        <button type="submit">Save Product</button>
      </div>
    </form>
  );
};

export default ProductForm;
