"use client";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import PictureUpload from "@/components/pictureUpload/pictureUpload";
import { VoiceChat } from "@/components/VoiceChat";

function Home() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app-container">
          <header className="app-header">
            <div className="app-brand">
              <h1>Nova Sonic 2</h1>
              <span className="app-subtitle">AI Voice Assistant</span>
            </div>
            <div className="user-info">
              <span>{user?.signInDetails?.loginId}</span>
              <button onClick={signOut} className="sign-out-btn">
                Sign out
              </button>
            </div>
          </header>
          <main className="app-main">
            <PictureUpload />
            <VoiceChat />
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default Home;
