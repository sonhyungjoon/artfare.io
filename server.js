const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let busLocation = { latitude: null, longitude: null };
let busClient = null;

server.on('connection', ws => {
    console.log('클라이언트 연결됨');

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);

            // 클라이언트의 역할 확인
            if (data.role === 'bus') {
                busClient = ws; // 버스 클라이언트를 따로 저장
                console.log('버스 클라이언트가 연결되었습니다.');
            } else if (data.role === 'passenger') {
                console.log('탑승객 클라이언트가 연결되었습니다.');
                
                // 버스 위치가 있다면, 탑승객에게 전송
                if (busLocation.latitude !== null && busLocation.longitude !== null) {
                    ws.send(JSON.stringify(busLocation));
                }
            }

            // 버스 클라이언트가 위치 정보를 보냈을 때
            if (data.latitude && data.longitude && ws === busClient) {
                busLocation = { latitude: data.latitude, longitude: data.longitude };

                // 모든 탑승객 클라이언트에게 위치 전송
                server.clients.forEach(client => {
                    if (client !== busClient && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(busLocation));
                    }
                });
            }

        } catch (error) {
            console.error('메시지 처리 오류:', error);
        }
    });

    ws.on('close', () => {
        if (ws === busClient) {
            console.log('버스 클라이언트 연결 해제');
            busClient = null;
        }
    });
});
