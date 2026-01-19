# 모임 API 테스트 가이드

## 📋 준비사항
- 백엔드 실행 중: http://localhost:8080
- 테스트 User 생성 완료 (id=1, email=test@test.com)

---

## 1️⃣ 모임 생성 API

### Request
```
POST http://localhost:8080/api/meetings
Content-Type: application/json
```

### Body
```json
{
  "title": "강남역 저녁 러닝 크루",
  "description": "매주 화요일 저녁 7시에 만나서 한강까지 달려요!",
  "imageUrl": "https://example.com/running.jpg",
  "location": "서울 강남구 강남대로 396",
  "latitude": 37.4979,
  "longitude": 127.0276,
  "locationDetail": "강남역 2번 출구",
  "maxMembers": 8,
  "meetingDate": "2026-01-20T19:00:00",
  "isApprovalRequired": false
}
```

### Expected Response (201 Created)
```json
{
  "meetingId": 1,
  "title": "강남역 저녁 러닝 크루",
  "description": "매주 화요일 저녁 7시에 만나서 한강까지 달려요!",
  "imageUrl": "https://example.com/running.jpg",
  "location": "서울 강남구 강남대로 396",
  "latitude": 37.4979,
  "longitude": 127.0276,
  "locationDetail": "강남역 2번 출구",
  "maxMembers": 8,
  "currentMembers": 1,
  "meetingDate": "2026-01-20T19:00:00",
  "status": "RECRUITING",
  "isApprovalRequired": false,
  "creator": {
    "userId": 1,
    "nickname": "테스터",
    "profileImage": "https://example.com/profile.jpg"
  },
  "createdAt": "2026-01-13T...",
  "updatedAt": "2026-01-13T..."
}
```

---

## 2️⃣ 모임 상세 조회 API

### Request
```
GET http://localhost:8080/api/meetings/1
```

### Expected Response (200 OK)
```json
{
  "meetingId": 1,
  "title": "강남역 저녁 러닝 크루",
  ...
}
```

---

## 3️⃣ 모임 목록 조회 API

### Request
```
GET http://localhost:8080/api/meetings?page=0&size=10
```

### Expected Response (200 OK)
```json
{
  "content": [
    {
      "meetingId": 1,
      "title": "강남역 저녁 러닝 크루",
      "imageUrl": "https://example.com/running.jpg",
      "location": "서울 강남구 강남대로 396",
      "meetingDate": "2026-01-20T19:00:00",
      "currentMembers": 1,
      "maxMembers": 8,
      "status": "RECRUITING"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 1,
  "totalPages": 1
}
```

---

## 4️⃣ DB 확인

### Meeting 테이블 확인
```sql
SELECT * FROM meeting;
```

### MeetingMember 테이블 확인 (생성자가 HOST로 등록되었는지)
```sql
SELECT * FROM meeting_member;
```

---

## ✅ 성공 기준

1. ✅ 모임 생성 시 201 Created 응답
2. ✅ currentMembers가 1로 시작
3. ✅ creator 정보가 포함됨
4. ✅ meeting_member 테이블에 HOST로 등록됨
5. ✅ 모임 조회 시 생성한 데이터가 조회됨
6. ✅ 목록 조회 시 페이징 정보 포함
