/**
 * UserBoard
 * @constructor
 * @description 这个组件是用来展示用户信息的,
 */
export default function UserBoard() {
  return (
    <div className={'grid gap-6'}>
      <div
        className={'p-4 rounded-lg shadow-md flex-col'}
        style={{
          background: 'var(--color-hot-border-background)',
          height: '20vh'
        }}
      >
        UserName ?
      </div>
      <div
        className={'p-4 rounded-lg shadow-md flex-col'}
        style={{
          background: 'var(--color-hot-border-background)',
          height: '20vh'
        }}
      >
        UserName ?
      </div>
      <div
        className={'p-4 rounded-lg shadow-md flex-col'}
        style={{
          background: 'var(--color-hot-border-background)',
          height: '20vh'
        }}
      >
        UserName ?
      </div>

      <div
        className={'p-4 rounded-lg shadow-md flex-col'}
        style={{
          background: 'var(--color-hot-border-background)',
          height: '20vh'
        }}
      >
        UserName ?
      </div>
    </div>

  )
}
