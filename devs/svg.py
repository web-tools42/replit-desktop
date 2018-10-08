import subprocess
import os


def exportsvg(fromDir, targetDir, exportType):
    print("开始执行转换命令...")
    for a, f, c in os.walk(fromDir):  # 使用walk遍历源目录
        for fileName in c:
            path = os.path.join(a, fileName)  # 获得文件路径
            if os.path.isfile(path) and fileName[-3:] == "svg":  # 判断文件是否为svg类型
                subprocess.call('convert -density 1200 -resize 1024x1024 {} {}/{}.png'.format(path,
                                                                                               exportDir, fileName[:3]),
                                 shell=True)

                print("Success start ", path, " -> ", exportDir + fileName[:3])


svgDir = './svg/'  # svg文件夹路径
exportDir = './png'  # 目的文件夹路径
if not os.path.exists(exportDir):
    os.mkdir(exportDir)

exportsvg(svgDir, exportDir, 'png')  # 转换主函数
