#! /user/bin/env python3

import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])

from match_server.match_service import Match
from queue import Queue
from time import sleep
from threading import Thread

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

q = Queue()

class Player:
    def __init__(self, score, uid, username, photo, channel_name):
        self.score = score
        self.uid = uid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0 # 等待时间

class Pool:
    def __init__(self):
        self.players = []

    def add_player(self, player):
        self.players.append(player)

    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    def check_match(self, a, b):
        pass

    def match(self):
        pass

class MatchHandler:
    def add_player(self, score, uid, username, photo, channel_name):
        player = Player(score, uid, username, photo, channel_name)
        queue.put(player)
        return 0

def worker():
    pool = Pool()
    while True:
        print("match")
        sleep(1)


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    server = TServer.TThreadedServer(processor, transport, tfactory, pfactory)

    Thread(target = worker, daemon = True).start()
    print('Starting the server...')
    server.serve()
    print('done.')
