export default function WebSiteAnalyze() {
  const code = `
     
      var _hmt = _hmt || [];
      
      (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?e50d2aa1ef0ebe2096aeaefa58c383cd";
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();
  
  `;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: code }} />
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-N76Z7R9X"
          height="0"
          width="0"
          style={{
            display: 'none',
            visibility: 'hidden',
          }}
        ></iframe>
      </noscript>
    </>
  );
}
