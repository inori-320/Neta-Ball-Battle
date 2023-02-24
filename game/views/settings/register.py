from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User
from game.models.players.players import Player

def register(request):
    data = request.GET
    username = data.get("username", "").strip()
    passwd_1 = data.get("passwd_1", "").strip()
    passwd_2 = data.get("passwd_2", "").strip()

    if not username or not passwd_1:
        return JsonResponse({
            'result': "用户名或密码不能为空！",
            })

    elif User.objects.filter(username = username).exists():
        return JsonResponse({
            'result': "用户名已存在！",
            })

    elif passwd_1 != passwd_2:
        return JsonResponse({
            'result': "两次密码不一致！"
            })

    else:
        user = User(username = username)
        user.set_password(passwd_1)
        user.save()
        Player.objects.create(user = user, photo = "http://59.110.53.20:8000/static/image/playground/head_port.jpg")
        login(request,user)
        return JsonResponse({
            'result': "success",
            })
