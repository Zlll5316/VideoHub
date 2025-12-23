#!/usr/bin/env python3
"""
快速测试 API 是否可用
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_health():
    """测试健康检查端点"""
    print("🔍 测试健康检查端点...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 健康检查通过: {json.dumps(data, indent=2, ensure_ascii=False)}")
            return True
        else:
            print(f"❌ 健康检查失败: HTTP {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务！")
        print("   请确保后端服务正在运行: python3 main.py")
        return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def test_fetch_videos():
    """测试获取最新视频端点"""
    print("\n🔍 测试获取最新视频端点...")
    try:
        response = requests.get(f"{API_URL}/fetch_latest_videos", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                print(f"✅ 获取视频成功: 找到 {data.get('count', 0)} 个视频")
                return True
            else:
                print(f"⚠️  获取视频失败: {data.get('message', '未知错误')}")
                return False
        else:
            print(f"❌ 请求失败: HTTP {response.status_code}")
            print(f"   响应: {response.text[:200]}")
            return False
    except requests.exceptions.Timeout:
        print("❌ 请求超时（30秒），可能是代理或网络问题")
        return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def test_analyze_video():
    """测试分析视频端点"""
    print("\n🔍 测试分析视频端点...")
    test_video_id = "ZK-rNEhJIDs"  # 使用一个已知的视频ID
    try:
        response = requests.get(f"{API_URL}/analyze_video?video_id={test_video_id}", timeout=60)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                print(f"✅ 分析视频成功！")
                return True
            else:
                print(f"⚠️  分析失败: {data.get('message', '未知错误')}")
                return False
        else:
            print(f"❌ 请求失败: HTTP {response.status_code}")
            print(f"   响应: {response.text[:200]}")
            return False
    except requests.exceptions.Timeout:
        print("❌ 请求超时（60秒），可能是AI API响应慢")
        return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("VideoHub API 测试工具")
    print("=" * 50)
    print()
    
    # 测试健康检查
    if not test_health():
        print("\n❌ 后端服务未运行或无法访问！")
        print("   请先启动后端: python3 main.py")
        exit(1)
    
    # 测试获取视频（可选，因为可能需要代理）
    print("\n" + "=" * 50)
    choice = input("是否测试获取最新视频？(需要代理，可能需要较长时间) [y/N]: ")
    if choice.lower() == 'y':
        test_fetch_videos()
    
    # 测试分析视频（可选，因为需要AI API）
    print("\n" + "=" * 50)
    choice = input("是否测试分析视频？(需要AI API，可能需要较长时间) [y/N]: ")
    if choice.lower() == 'y':
        test_analyze_video()
    
    print("\n" + "=" * 50)
    print("✅ 测试完成！")
    print("=" * 50)
