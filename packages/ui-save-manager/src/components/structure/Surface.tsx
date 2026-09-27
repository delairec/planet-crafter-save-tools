import {JSX} from 'solid-js';

interface SurfaceProps {
  bordered?: boolean;
  children: JSX.Element;
}

export default function Surface(props: SurfaceProps) {
  return (
    <div class="surface" classList={{'surface-bordered': props.bordered}}>
      {props.children}
    </div>
  );
}
