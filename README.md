# 🚀 P2P File Sharing Demo

> 📡 **Share files directly between devices without any cloud storage!**

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)

## ✨ Features

-   🔒 **Secure P2P Transfer** - Direct device-to-device file sharing
-   🌐 **No Cloud Storage** - Files never touch a server
-   📁 **Multiple Files** - Send multiple files at once
-   🚫 **No Size Limits** - Transfer files of any size
-   📱 **Responsive Design** - Works on desktop and mobile
-   ⚡ **Real-time Connection** - Instant peer discovery
-   🎨 **Modern UI** - Beautiful interface with Tailwind CSS

## 🛠️ Technology Stack

| Technology                | Purpose                    |
| ------------------------- | -------------------------- |
| 🟢 **Node.js**            | Server runtime             |
| 🚀 **Express.js**         | Web framework              |
| 🔌 **Socket.IO**          | Real-time communication    |
| 🌐 **WebRTC**             | Peer-to-peer data channels |
| 🎨 **Tailwind CSS**       | Modern styling             |
| ⚡ **Vanilla JavaScript** | Client-side logic          |

## 🚀 Quick Start

### Prerequisites

-   📦 Node.js (version 14 or higher)
-   📦 npm or yarn package manager

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/Redlio-Designs/Redlio-File-sharing.git
    cd Redlio-File-sharing
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start the server**

    ```bash
    npm start
    ```

4. **Open your browser**
    ```
    http://localhost:3001
    ```

## 📖 How to Use

### 🎯 Sending Files

1. 📂 **Select Files**: Click "Choose Files" or drag & drop files
2. 🔗 **Generate Link**: Click "Create Share Link"
3. 📤 **Share**: Copy the generated link and send it to the receiver
4. ⏳ **Wait**: Keep the page open until transfer completes

### 📥 Receiving Files

1. 🔗 **Open Link**: Click the shared link from the sender
2. 🤝 **Connect**: Wait for the P2P connection to establish
3. 📂 **Download**: Files will automatically download to your device

## 🏗️ Project Structure

```
p2p-demo/
├── 📁 public/
│   ├── 📄 send.html          # File sender interface
│   ├── 📄 receive.html       # File receiver interface
│   ├── 📄 test_send.html     # Testing sender page
│   └── 📄 test_receive.html  # Testing receiver page
├── 📄 server.js              # Express server with Socket.IO
├── 📄 package.json           # Project dependencies
└── 📄 README.md              # This file
```

## 🔧 How It Works

[![](https://mermaid.ink/img/pako:eNpdkc1Kw0AQgF9lmXNa2jRpfg6CTVrwIJa2INj0sE2mzdJkN2y2RS09ePAmeFA8KV70Abz5PL6APoLbtFJwYWGH-b4ZdmYNsUgQfJhLWqRkFEac6HM8_nl9ev_-vCdD5AlKEuKKxTghtdoR6ejk4x0ZiniBqn5yphm5QjnZqYHOPnyQAcbIVv_NHdKpglCDby-kb_ZJIDjHWDHBSbdUdJqxMsVkXzCs6O627A0JmdQg6bEMyUhSXs50ixWj5Byng1GwV7qV0ht_Pd8eqEDkRYYKJ2Do37IE_BnNSjQgR5nTbQzrrR6BSjHHCHz9TKhcRBDxjZYKyi-EyMFXcqk1KZbz9C9YFglVGDKq53ggqtkFYskV-HarqgD-Gi7Bt0yzrq9jepZnNl3HNuBqy9Qdy2rYpuu2vbbpehsDrquWjbpjt12r5bhW07VNq-UZgAlTQp7u9letcfMLipmWfA?type=png)](https://mermaid.live/edit#pako:eNpdkc1Kw0AQgF9lmXNa2jRpfg6CTVrwIJa2INj0sE2mzdJkN2y2RS09ePAmeFA8KV70Abz5PL6APoLbtFJwYWGH-b4ZdmYNsUgQfJhLWqRkFEac6HM8_nl9ev_-vCdD5AlKEuKKxTghtdoR6ejk4x0ZiniBqn5yphm5QjnZqYHOPnyQAcbIVv_NHdKpglCDby-kb_ZJIDjHWDHBSbdUdJqxMsVkXzCs6O627A0JmdQg6bEMyUhSXs50ixWj5Byng1GwV7qV0ht_Pd8eqEDkRYYKJ2Do37IE_BnNSjQgR5nTbQzrrR6BSjHHCHz9TKhcRBDxjZYKyi-EyMFXcqk1KZbz9C9YFglVGDKq53ggqtkFYskV-HarqgD-Gi7Bt0yzrq9jepZnNl3HNuBqy9Qdy2rYpuu2vbbpehsDrquWjbpjt12r5bhW07VNq-UZgAlTQp7u9letcfMLipmWfA)

### 🔍 Technical Flow

1. **🔗 Link Generation**: Sender creates a unique room ID
2. **🤝 Peer Discovery**: Both devices join the same Socket.IO room
3. **🔄 Signaling**: WebRTC offer/answer exchange via Socket.IO
4. **📡 P2P Connection**: Direct WebRTC data channel established
5. **📁 File Transfer**: Files sent directly between devices
6. **🎉 Completion**: Automatic download on receiver's device

## 🎨 Screenshots

### 📤 Sender Interface

_Clean, modern interface for selecting and sharing files_

### 📥 Receiver Interface

_Simple receiver page with real-time transfer progress_

## 🔧 API Endpoints

| Route      | Method | Description      |
| ---------- | ------ | ---------------- |
| `/`        | GET    | 📤 Sender page   |
| `/receive` | GET    | 📥 Receiver page |

## 🌐 Socket.IO Events

| Event         | Direction       | Description                        |
| ------------- | --------------- | ---------------------------------- |
| `join`        | Client → Server | 🚪 Join a transfer room            |
| `signal`      | Client ↔ Server | 🔄 WebRTC signaling data           |
| `peer-joined` | Server → Client | 🤝 Peer connection notification    |
| `peer-left`   | Server → Client | 👋 Peer disconnection notification |

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   💡 **WebRTC** community for P2P technology
-   🎨 **Tailwind CSS** for beautiful styling
-   🔌 **Socket.IO** for real-time communication
-   🚀 **Express.js** for the web framework

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ By Redlio Magicians

</div>
