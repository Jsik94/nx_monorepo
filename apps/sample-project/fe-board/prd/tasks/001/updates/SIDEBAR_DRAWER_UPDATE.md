# 사이드바 드로어 기능 업데이트

## 📋 업데이트 개요

사이드바를 오른쪽에서 왼쪽으로 이동하고, 모바일에서 드로어 형태로 열고 닫을 수 있는 기능을 추가했습니다.

## 🎯 주요 변경사항

### 1. SidebarContext 추가
- **파일**: `src/contexts/SidebarContext.tsx`
- **기능**: 사이드바 열림/닫힘 상태 관리
- **메서드**: 
  - `isOpen`: 현재 상태
  - `toggle()`: 토글
  - `open()`: 열기
  - `close()`: 닫기

```typescript
interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}
```

### 2. 사이드바 레이아웃 변경
- **위치**: 오른쪽 → 왼쪽으로 이동
- **모바일**: Fixed position으로 오버레이 드로어
- **데스크톱**: Static position으로 고정 사이드바
- **애니메이션**: Transform과 transition 적용

### 3. 반응형 디자인
- **모바일 (< lg)**: 
  - 햄버거 메뉴 버튼으로 사이드바 토글
  - 배경 오버레이로 사이드바 외부 클릭 시 닫기
  - 사이드바 상단에 닫기 버튼
- **데스크톱 (≥ lg)**: 
  - 사이드바 항상 표시
  - 메인 콘텐츠에 `ml-80` 마진 적용

### 4. 헤더 업데이트
- 모바일에서 햄버거 메뉴 버튼 추가
- `Menu` 아이콘 사용
- SidebarContext의 `toggle` 함수 연결

## 📁 변경된 파일들

### 새로 생성된 파일
```
src/contexts/SidebarContext.tsx          # 사이드바 상태 관리 컨텍스트
```

### 수정된 파일
```
src/components/layout/RootLayout.tsx     # SidebarProvider 적용, 레이아웃 수정
src/components/layout/Header.tsx         # 햄버거 메뉴 버튼 추가
src/components/layout/Sidebar.tsx        # 드로어 기능, 애니메이션, 오버레이 추가
```

## 🎨 CSS 클래스 및 스타일링

### 사이드바 스타일
```css
/* 기본 사이드바 */
fixed left-0 top-0 h-full w-80 bg-white border-r z-50 
transform transition-transform duration-300 ease-in-out

/* 모바일에서 닫힌 상태 */
-translate-x-full

/* 모바일에서 열린 상태 */
translate-x-0

/* 데스크톱에서 항상 표시 */
lg:translate-x-0 lg:static lg:z-auto
```

### 오버레이 스타일
```css
/* 배경 오버레이 */
fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden
```

### 메인 콘텐츠 스타일
```css
/* 데스크톱에서 사이드바 공간 확보 */
flex-1 lg:ml-80 px-4 py-8
```

## 🔧 사용법

### 컴포넌트에서 사이드바 제어
```typescript
import { useSidebar } from '@/contexts/SidebarContext';

function MyComponent() {
  const { isOpen, toggle, open, close } = useSidebar();
  
  return (
    <button onClick={toggle}>
      사이드바 토글
    </button>
  );
}
```

### 사이드바 상태 확인
```typescript
const { isOpen } = useSidebar();

return (
  <div className={isOpen ? 'sidebar-open' : 'sidebar-closed'}>
    {/* 콘텐츠 */}
  </div>
);
```

## 📱 반응형 동작

### 모바일 (< 1024px)
1. 사이드바는 기본적으로 숨겨짐
2. 헤더의 햄버거 버튼 클릭 시 사이드바 나타남
3. 배경 오버레이 또는 X 버튼으로 사이드바 닫기
4. 부드러운 슬라이드 애니메이션

### 데스크톱 (≥ 1024px)
1. 사이드바 항상 표시
2. 메인 콘텐츠가 사이드바 옆에 배치
3. 햄버거 버튼 숨김

## ✅ 테스트 체크리스트

- [ ] 모바일에서 햄버거 버튼이 표시되는가?
- [ ] 햄버거 버튼 클릭 시 사이드바가 열리는가?
- [ ] 오버레이 클릭 시 사이드바가 닫히는가?
- [ ] X 버튼 클릭 시 사이드바가 닫히는가?
- [ ] 데스크톱에서 사이드바가 항상 표시되는가?
- [ ] 사이드바 애니메이션이 부드러운가?
- [ ] 메인 콘텐츠 레이아웃이 올바른가?

## 🚀 향후 개선사항

1. **사이드바 너비 조절**: 드래그로 사이드바 너비 조절 기능
2. **키보드 접근성**: ESC 키로 사이드바 닫기
3. **포커스 관리**: 사이드바 열릴 때 포커스 이동
4. **애니메이션 개선**: 스프링 애니메이션 또는 더 부드러운 효과
5. **상태 유지**: 사용자 설정으로 기본 열림/닫힘 상태 저장

---

**업데이트 일시**: 2024-01-XX  
**업데이트 완료**: ✅  
**담당자**: AI Assistant
