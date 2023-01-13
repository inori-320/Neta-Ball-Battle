from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    head = '<h1 style = "text-align:center"> 原神 </h1>'
    image = '<img src = "https://img1.baidu.com/it/u=2837266391,3441220502&fm=253&fmt=auto&app=138&f=PNG?w=183&h=134" width = 500 style = "text-align:center">'
    return HttpResponse(head + image)



if __name__ == '__main__':
    pass
