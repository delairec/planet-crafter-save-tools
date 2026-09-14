interface IconProps {
  content: string
}

export default function Icon(props: IconProps) {
  return <span aria-hidden="true">{props.content}</span>
}
