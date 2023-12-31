from django.shortcuts import redirect
from django.core.cache import cache
from django.contrib.auth.models import User
from django.contrib.auth import login
from game.models.players.players import Player
import requests
import random

def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return redirect("index")
    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "4634",
        'secret': "6be8cc12299043ad8f238c7985ffaf59",
        'code': code
    }
    access_token_res = requests.get(apply_access_token_url, params = params).json()
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid = openid)
    if players.exists():
        login(request, players[0].user)
        return redirect("index")

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token': access_token,
        'openid': openid
    }
    userinfo_res = requests.get(get_userinfo_url, params = params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username = username).exists():
        username += str(random.randint(0, 9))

    user = User.objects.create(username = username)
    player = Player.objects.create(user = user, photo = photo, openid = openid)
    login(request, user)
    return redirect("index")
