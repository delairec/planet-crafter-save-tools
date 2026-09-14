import {For, Resource} from "solid-js";
import FieldsGroup from "~/components/structure/FieldsGroup";
import SectionState from "~/components/structure/SectionState";
import {PlayersViewModel} from "core-mapping/presentation/viewModels/PlayersViewModel";
import {playersSectionTitle} from "~/messages/playersSectionMessages";

interface PlayersProps {
  viewModel: Resource<PlayersViewModel>;
}

export default function PlayersSection(props: PlayersProps) {
  return (
    <SectionState title={playersSectionTitle} resource={props.viewModel}>
      {(players) => (<>
        <h3>{playersSectionTitle}</h3>
        <div class="grid-container">
          <For each={players().players}>
            {(player) => (
              <div class="grid-item">
                <h4>{player.name}</h4>
                <div class="fields-group-container">
                  <FieldsGroup columns={() => player.columns}/>
                </div>
              </div>
            )}
          </For>
        </div>
      </>)}
    </SectionState>
  );
}
