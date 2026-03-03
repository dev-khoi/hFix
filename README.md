# DadAi - Amazon Nova Hack 2026

A full-stack AI application combining voice chat, image analysis, and cloud storage capabilities powered by AWS services and Amazon Nova AI models.

## Project Overview

DadAi is a comprehensive application that integrates:

- **Voice-based AI Chat**: Real-time conversation with Amazon Nova Sonic voice bot
- **Image Analysis**: Intelligent image processing and analysis using Amazon Nova
- **Cloud Storage**: Automatic image and analysis result persistence on S3
- **User Management**: Authentication via AWS Cognito and user sync to DynamoDB

## Architecture

### Backend (`/backend`)

Serverless backend infrastructure using AWS SAM (Serverless Application Model) with Python Lambda functions.

#### Core Components:

1. **Image Analysis API** (`uploadImage/`)
   - Lambda function for image uploads and processing
   - Analyzes images using Amazon Nova models
   - Stores images and analysis results to S3
   - Key files:
     - `app.py` - Lambda handler for HTTP requests
     - `imageAnalyzeBot.py` - Core image analysis logic

2. **Voice Chat Service** (`voiceChat/`)
   - Integration with Amazon Nova Sonic voice bot
   - Real-time voice processing and responses
   - Key files:
     - `chatbot.py` - Chatbot logic and conversation management
     - `nova_sonic_bridge.py` - Bridge to Amazon Nova Sonic API

3. **Configuration** (`config/`)
   - Centralized AWS and application settings
   - Environment-specific configurations

#### AWS Services Used:

- **Lambda**: Serverless compute for image analysis and processing
- **S3**: Storage for images and analysis results
- **DynamoDB**: User data persistence
- **Amazon Nova**: AI models for voice and image analysis

#### Deployment:

- SAM CLI configuration (`samconfig.toml`, `template.yaml`)
- Infrastructure as Code approach for reproducible deployments

---

### Frontend (`/dad-fix`)

Next.js 14+ React application with real-time voice chat and image upload capabilities.

#### Key Features:

1. **Authentication**
   - AWS Cognito integration
   - Secure user login/signup
   - Token-based session management

2. **Voice Chat Interface** (`components/VoiceChat.tsx`)
   - Real-time audio recording using Web Audio API
   - Audio playback for bot responses
   - Visual feedback for recording/playback states
   - Custom hooks:
     - `useAudioRecorder.ts` - Audio capture management
     - `useAudioPlayer.ts` - Audio playback control
     - `useNovaSonic.ts` - Nova Sonic API integration

3. **Image Upload** (`components/pictureUpload/`)
   - Multi-file image upload
   - Instant file preview
   - Base64 encoding for transmission
   - Integration with backend image analysis

4. **Chat Interface** (`app/(auth)/chat/`)
   - Conversation history display
   - Multi-turn chat support
   - Dynamic conversation routing with `[selectedId]/` parameter

5. **UI Components** (`components/ui/`)
   - Reusable design system components
   - Shadcn/ui based components:
     - Button, Input, Separator
     - Sheet (side panel), Sidebar
     - Skeleton (loading states), Tooltip

#### Amplify Backend Integration (`amplify/`)

- **API Function**: Custom Lambda handler for dynamic APIs
- **Authentication**: Cognito setup for user management
- Connects frontend requests to backend services

#### Tech Stack:

- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **Audio Processing**: Web Audio API
- **AWS Integration**: AWS SDK, Amplify

---

## Data Flow

```
User Browser
    ↓
Next.js Frontend (dad-fix)
    ├─→ Cognito Authentication
    ├─→ Voice Chat → useNovaSonic → Amplify API → Nova Sonic Lambda
    └─→ Image Upload → pictureUpload → Amplify API → Image Analysis Lambda
                                            ↓
                                       S3 (Images)
                                       S3 (Analysis Results)
                                       DynamoDB (User Data)
```

## Project Structure

```
amplify-react-amazon-nova-2-sonic-voice-chat/
├── backend/                          # SAM Lambda functions
│   ├── src/
│   │   ├── main.py                  # Main handler
│   │   ├── config/                  # Configuration
│   │   ├── uploadImage/             # Image analysis lambda
│   │   └── voiceChat/               # Voice chat lambda
│   └── template.yaml                # SAM infrastructure template
│
└── dad-fix/                          # Next.js frontend
    ├── app/                         # Next.js app router
    │   ├── (auth)/                  # Protected routes
    │   │   ├── chat/               # Chat interface
    │   │   └── [selectedId]/       # Dynamic chat selection
    │   └── layout.tsx              # Root layout
    ├── components/                  # React components
    │   ├── VoiceChat.tsx           # Voice chat UI
    │   ├── pictureUpload/          # Image upload
    │   ├── AppSidebar.tsx          # Navigation
    │   └── ui/                     # Design system
    ├── hooks/                      # Custom React hooks
    │   ├── useAudioRecorder.ts
    │   ├── useAudioPlayer.ts
    │   ├── useNovaSonic.ts
    │   └── use-mobile.ts
    ├── amplify/                    # AWS Amplify config
    │   ├── api-function/           # Custom API handlers
    │   └── auth/                   # Cognito setup
    └── public/                     # Static assets
        └── audio-processor.js      # Web Audio worker
```

## Key Technologies

### Backend

- Python 3.x
- AWS Lambda (SAM)
- Amazon Nova (Sonic model)
- AWS S3, DynamoDB

### Frontend

- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui
- AWS Amplify

### Infrastructure

- AWS SAM CLI
- AWS Amplify
- AWS Cognito
- AWS CloudFormation

## Development Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
sam build
sam local start-api
```

### Frontend

```bash
cd dad-fix
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Summary

| Feature         | Backend                | Frontend                       |
| --------------- | ---------------------- | ------------------------------ |
| Voice Chat      | Nova Sonic Lambda      | VoiceChat.tsx + useNovaSonic   |
| Image Analysis  | ImageAnalyzeBot Lambda | pictureUpload + S3 integration |
| Authentication  | Cognito setup          | Auth layout protection         |
| User Storage    | DynamoDB sync          | Session management             |
| API Integration | API-Function Lambda    | useNovaSonic hook              |

## Deployment

- **Backend**: AWS SAM CLI (`sam deploy`)
- **Frontend**: Amplify Hosting or Vercel
- **Infrastructure**: CloudFormation stack managed by SAM

## Next Steps

- [ ] Complete image analysis model training
- [ ] Add conversation history persistence
- [ ] Implement user preference management
- [ ] Add real-time notifications
- [ ] Enable offline mode with service workers
