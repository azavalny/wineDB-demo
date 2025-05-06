import { useState } from "react";
import axios from "axios";

const profileSetUp = "http://localhost:8080/api-set-up-profile";

interface createProps{
    username: string;
    ready: boolean;
}

function CreateProfile({username, ready}: createProps) {
    const [bio, setBio] = useState("");
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [backgroundPic, setBackgroundPic] = useState<File | null>(null);


    async function formSubmissionHandler() {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("bio", bio);
        if (profilePic) formData.append("profilePic", profilePic);
        if (backgroundPic) formData.append("backgroundPic", backgroundPic);

        try {
            const response = await axios.post(profileSetUp, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log("Server response:", response.data);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    }

    return (
        <div>
            <form>
                <label>
                    Profile Picture:
                    <input 
                        type="file" 
                        name="profilePic" 
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setProfilePic(file);
                            }
                          }}
                    />
                </label>
                <br />
                <label>
                    Bio:
                    <input 
                        type="text" 
                        name="bio" 
                        onChange={(e) => setBio(e.target.value)} 
                    />
                </label>
                <br />
                <label>
                    Background Picture:
                    <input 
                        type="file" 
                        name="backgroundPic" 
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBackgroundPic(file);
                            }
                          }}
                          
                    />
                </label>
            </form>
            <button onClick={formSubmissionHandler}>Submit</button>
        </div>
    );
}

export default CreateProfile;
