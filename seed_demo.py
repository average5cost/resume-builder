import json, urllib.request, urllib.error

BASE = "http://localhost:8080"

def api(method, path, token=None, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()}")
        return None

# Register and login
print("=== Login ===")
r = api("POST", "/api/auth/login", body={"username": "demo", "password": "demo123"})
if not r:
    print("=== Register ===")
    r = api("POST", "/api/auth/register", body={"username": "demo", "password": "demo123"})
token = r["token"]
print(f"User: {r['user']['username']}")

# Create resume
print("=== Create Resume ===")
r = api("POST", "/api/resumes", token, {"title": "陈亦超 - 个人简历"})
rid = r["id"]
print(f"Resume ID: {rid}")

# Set professional template
api("PUT", f"/api/resumes/{rid}", token, {"template_id": "professional"})

# Add modules
module_types = [
    "personal_info", "education", "project", "research", "internship",
    "skills_certs", "personal_summary", "club_org", "honors_awards"
]
mids = {}
for mt in module_types:
    r = api("POST", f"/api/resumes/{rid}/modules", token, {"type": mt})
    mids[mt] = r["id"]
    print(f"  {mt} -> {r['id']}")

# Fill data
data_map = {
    "personal_info": {
        "name": "陈亦超",
        "job_title": "软件开发工程师",
        "email": "chenyichao@example.com",
        "phone": "138-0000-0000",
        "city": "北京",
        "website": "blog.yichao.dev",
        "github": "github.com/yichao",
        "linkedin": "linkedin.com/in/yichao",
    },
    "education": {
        "entries": [
            {"school": "清华大学", "degree": "硕士", "major": "计算机科学与技术", "start": "2022-09", "end": "2025-06", "gpa": "3.9/4.0"},
            {"school": "华中科技大学", "degree": "本科", "major": "软件工程", "start": "2018-09", "end": "2022-06", "gpa": "3.8/4.0"},
        ]
    },
    "project": {
        "entries": [
            {"name": "分布式缓存系统", "role": "核心开发者", "start": "2023-06", "end": "2023-12",
             "description": "基于Go语言实现的高性能分布式缓存系统，支持LRU/LFU淘汰策略、HTTP/gRPC双协议访问、一致性哈希分片。单节点QPS达到10万+，P99延迟小于5ms。",
             "link": "github.com/yichao/gocache"},
            {"name": "微服务API网关", "role": "项目负责人", "start": "2023-01", "end": "2023-05",
             "description": "设计和实现了一个轻量级API网关，支持动态路由、限流熔断、JWT鉴权、请求聚合等功能。基于Go-zero框架开发，已部署于Kubernetes集群。",
             "link": "github.com/yichao/apigate"},
        ]
    },
    "research": {
        "entries": [
            {"title": "大语言模型在代码审查中的应用研究", "institution": "清华大学NLP实验室", "role": "研究助理",
             "start": "2023-09", "end": "2024-06",
             "description": "探索基于Code LLM的自动化代码审查流水线，设计了上下文感知的diff分析算法和基于检索增强生成的修复建议系统。研究成果发表于ICSE 2024 Workshop。"},
        ]
    },
    "internship": {
        "entries": [
            {"company": "字节跳动", "position": "后端开发实习生", "start": "2024-06", "end": "2024-09",
             "description": "参与广告投放系统的后端开发，负责投放策略引擎的性能优化。通过改进索引结构和批量查询优化，将广告匹配延迟从120ms降低至35ms。使用Go和Python进行开发，深度参与代码评审。"},
            {"company": "腾讯", "position": "云计算实习生", "start": "2023-07", "end": "2023-09",
             "description": "参与腾讯云Serverless平台开发，负责函数计算冷启动优化。通过镜像预热和快照恢复技术，将函数冷启动时间从2.3s降低至0.6s。"},
        ]
    },
    "skills_certs": {
        "skills": ["Go", "Python", "Java", "C/C++", "TypeScript", "React", "Docker", "Kubernetes", "MySQL", "Redis", "Kafka", "gRPC", "Linux"],
        "certificates": [
            {"name": "CKA (Certified Kubernetes Administrator)", "date": "2024-03"},
            {"name": "AWS Solutions Architect Associate", "date": "2023-08"},
        ],
        "languages": [
            {"name": "英语", "level": "CET-6 / 流利读写"},
            {"name": "普通话", "level": "母语"},
        ]
    },
    "personal_summary": {
        "content": "热爱技术的软件工程师，具有扎实的计算机科学基础和丰富的项目经验。擅长Go、分布式系统和云原生技术栈。在字节跳动和腾讯的实习经历中，积累了大量后端系统开发和性能优化的实践经验。热衷于开源社区，是多个Go生态项目的贡献者。期待在充满挑战的环境中继续成长，用技术创造价值。"
    },
    "club_org": {
        "entries": [
            {"name": "清华大学开源技术协会", "role": "副会长", "start": "2023-09", "end": "2024-06",
             "description": "组织校内技术分享活动，邀请业界专家进行技术讲座。主导组织了清华大学第一届开源黑客松比赛，吸引200+同学参与。"},
            {"name": "ACM竞赛队", "role": "队员", "start": "2019-09", "end": "2022-06",
             "description": "参加ICPC亚洲区域赛，获得银牌。负责算法研究和代码实现，锻炼了算法思维和团队协作能力。"},
        ]
    },
    "honors_awards": {
        "entries": [
            {"name": "国家奖学金", "date": "2024-10", "issuer": "教育部"},
            {"name": "清华之友奖学金", "date": "2023-10", "issuer": "清华大学"},
            {"name": "ICPC亚洲区域赛银牌", "date": "2021-12", "issuer": "ACM-ICPC"},
            {"name": "全国大学生数学建模竞赛一等奖", "date": "2021-05", "issuer": "中国工业与应用数学学会"},
        ]
    },
}

print("=== Fill Data ===")
for mt, mid in mids.items():
    data = json.dumps(data_map[mt])  # module data as JSON string
    body = {"data": data}
    api("PUT", f"/api/modules/{mid}", token, body)
    print(f"  {mt} OK")

print()
print("=== DONE! ===")
print("Login: username=demo, password=demo123")
print("Visit: http://localhost:5173")
