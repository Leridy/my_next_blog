export default function WebSiteAnalyze() {
  const code = `
      <script>
      var _hmt = _hmt || [];
      
      (function() {
      const hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?e50d2aa1ef0ebe2096aeaefa58c383cd";
      const s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();
    </script>
  `
  return (
    <>
      {code}
    </>
  );
}
