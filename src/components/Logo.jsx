export default function Logo({ className = '', mark = false }) {
  return (
    <span className={'inline-flex items-center gap-2.5 ' + className}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink">
        <svg viewBox="0 0 64 64" className="h-5 w-5">
          <path
            d="M14 48 L32 16 L50 48 Z"
            fill="none"
            stroke="#e27d38"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M24 48 L32 34 L40 48 Z" fill="#e27d38" />
        </svg>
      </span>
      {!mark && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Smai<span className="text-ember-500"> IELTS</span>
        </span>
      )}
    </span>
  )
}