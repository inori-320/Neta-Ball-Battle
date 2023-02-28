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
    redirect_uri = quote("https://app4634.acapp.acwing.com.cn/settings/acwing/web/receive_code/")
    scope = "userinfo"
    state = get_state()
    cache.set(state, True, 7200)
    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
        })
