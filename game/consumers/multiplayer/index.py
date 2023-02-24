from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None

        for i in range(1000):
            if not cachre.has_key(name) or len(cache.get(name)) < settings.Room_Capacity:
                self.room_name = name
                break

        if not self.room_name:
            return

        await self.accept()

        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 1800)

        for player in cache.get(self.room_name):
            await self.send(text_data = json.dumps({
                'event': "create_player",
                'uid': player['uid'],
                'username': player['username'],
                'photo': player['photo'],
                }))
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uid': data['uid'],
            'username': data['username'],
            'photo': data['photo'],
            })
        cache.set(self.room_name, players, 1800)
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "create_player",
                'uid': data['uid'],
                'username': data['username'],
                'photo': data['photo']
            }
        )

    async def group_send_event(self, data):
        await self.send(text_data = json.dumps(data))

    async def move(self, data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "gounp_send_event",
                    'event': "move",
                    'uid': data['uid'],
                    'tx': data['tx'],
                    'ty': data['ty'],
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move":
            await self.move_to(data)
