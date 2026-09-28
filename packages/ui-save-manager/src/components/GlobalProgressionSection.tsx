import {Resource} from "solid-js";
import Card from "./structure/Card";
import FieldsGroup from "./structure/FieldsGroup";
import SectionState from "./structure/SectionState";
import {GlobalProgressionViewModel} from "core-mapping/presentation/viewModels/GlobalProgressionViewModel";
import {globalProgressionSectionTitle} from "~/messages/globalProgressionSectionMessages";

interface GlobalProgressionProps {
  viewModel: Resource<GlobalProgressionViewModel>;
}

export default function GlobalProgressionSection(props: GlobalProgressionProps) {
  return (
    <SectionState title={globalProgressionSectionTitle} resource={props.viewModel}>
      {(globalProgression) => (
        <Card title={globalProgressionSectionTitle} testId="global-progression">
          <div class="fields-group-container">
            <FieldsGroup columns={() => globalProgression().statistics.columns} testId="global-progression"/>
          </div>
        </Card>
      )}
    </SectionState>
  );
}
