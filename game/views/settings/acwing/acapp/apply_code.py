from django.http import JsonResponse
from urllib.parse import quote
from django.core.cache import cache
import random

def get_state():
    ans = ""
    for i in range(8):
        ans += str(random.randint(0, 9))
    return ans

def apply_code(request):
    appid = "4634"
    redirect_uri = quote("https://app4634.acapp.acwing.com.cn/settings/acwing/acapp/receive_code/")
    scope = "userinfo"
    state = get_state()
    cache.set(state, True, 7200)
    return JsonResponse({
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
        })
