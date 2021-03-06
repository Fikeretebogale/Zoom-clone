const socket = io("/");
const myPeer = new Peer(undefined, {
	path: "/peerjs",
	host: "/",
	port: "3000",
});
const peers = {};
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
let myVideoStream;
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: false,
	})
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream);
		myPeer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});
		socket.on("user_connected", (userId) => {
			setTimeout(function () {
				connectToNewUser(userId, stream);
			}, 1000);
		});
		let text = $("input");
		// when press enter send message
		$("html").keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit("message", text.val());
				text.val("");
			}
		});
		socket.on("createMessage", (message) => {
			$("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
			scrollToBottom();
		});
	});
myPeer.on("open", (id) => {
	console.log(id);
	socket.emit("join-room", ROOM_ID, id);
});

socket.on("user_disconnected", (userId) => {
	if (peers[userId]) {
		peers[userId].close();
	}
});
function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
	});
	videoGrid.append(video);
}
function connectToNewUser(userId, stream) {
	// console.log("someone on front connected", userId);
	const call = myPeer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
	call.on("close", () => {
		video.remove();
	});

	peers[userId] = call;
}
