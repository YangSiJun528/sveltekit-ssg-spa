<!-- 모듈 스크립트 or +page/layout.ts에서 prerender나 ssr을 허용하지 않으면 CSR로 동작합니다. -->
<h1>Dashboard</h1>
<p>이곳은 대시보드 진입점 페이지입니다. 클라이언트 라우터가 관리합니다.</p>

<nav>
    <a href="/dashboard/settings">Settings</a>
</nav>

<!-- 대시보드 하위 내용이 표시될 곳 -->
<slot />
