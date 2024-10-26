interface LinkFrameProps {
  url: string;
  title: string;
  onClose?: () => void;
}

export default function LinkFrame(props: LinkFrameProps) {
  const {url, title, onClose} = props;
  return (
    <div
        className={'fixed top-0 left-0 bg-white shadow-lg'}
    >
      <nav>
        <h1>{title}</h1>
        <button onClick={onClose}>关闭</button>
      </nav>
      <iframe
        sandbox={'allow-scripts allow-top-navigation'}
        title={title}
        src={url}
        className={'w-full h-full'}
        style={{
          zIndex: 100,
          height: 'calc(80vh - 4rem)',
          width: 'calc(80vw - 4rem)',
        }}
      />
    </div>

  )
}
