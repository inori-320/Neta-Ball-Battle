from django.http import JsonResponse
from django.urls import path
from game.views.settings.acwing.web.apply_code import apply_code as web_apply
from game.views.settings.acwing.web.receive_code import receive_code as web_receive
from game.views.settings.acwing.acapp.apply_code import apply_code as acapp_apply
from game.views.settings.acwing.acapp.receive_code import receive_code as acapp_receive

urlpatterns = [
        path("web/apply_code/", web_apply, name = "web_apply_code"),
        path("web/receive_code/", web_receive, name = "web_receive_code"),
        path("acapp/apply_code/", acapp_apply, name = "acapp_apply_code"),
        path("acapp/receive_code/", acapp_receive, name = "acapp_receive_code"),
    ]
