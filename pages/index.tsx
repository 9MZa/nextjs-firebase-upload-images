import React, { useState } from "react";
import { storage_bucket } from "../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

export default function Home() {
  const [url, setUrl] = useState<String>("");
  const [progress, setProgress] = useState(0);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    const fileType = file?.name.split(".").pop();
    const storageRef = ref(storage_bucket, `images/${uuidv4()}.${fileType}`);
    const uploadTask = uploadBytesResumable(storageRef, file!);
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setProgress(progress);
      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          console.log("Upload is running");
          break;
      }
    });

    // get download url
    uploadTask.then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setUrl(url);
      });
    });
  }

  return (
    <div className="container">
      <div className="dropzone">
        <div>
          <h1>Upload Image</h1>
        </div>
        <div>
          <input type="file" onChange={handleFile} />
        </div>
      </div>

      <div className="progress">
        {progress > 1 ? (
          <>
            {progress < 100 ? (
              <a href="#" aria-busy="true">
                Uploading...
              </a>
            ) : (
              ""
            )}
            <progress value={progress.toFixed()} max="100"></progress>
          </>
        ) : null}
      </div>

      <div className="result">
        {progress === 100 ? (
          <article>
            <a href={String(url)}>{url}</a>
            <hr />
            <Image
              src={String(url)}
              alt="Landscape picture"
              width={500}
              height={500}
            />
          </article>
        ) : null}
      </div>
    </div>
  );
}
