<script>
    import { page } from '$app/state';
    import { dev } from '$app/environment';
</script>

<svelte:head>
    <title>오류 발생</title>
</svelte:head>

<div class="error-container">
    <h1>{page.status}</h1>
    <h2>{page.error?.message || '알 수 없는 오류가 발생했습니다'}</h2>

    {#if page.status === 404}
        <p>요청하신 페이지를 찾을 수 없습니다.</p>
        <a href="/">홈으로 돌아가기</a>
    {:else}
        <p>서버에서 오류가 발생했습니다.</p>
        <a href="/">홈으로 돌아가기</a>
        {#if dev}
            <details>
                <summary>개발자 정보</summary>
                <pre>{page.error?.message}</pre>
            </details>
        {/if}
    {/if}
</div>
