import {Resource} from "solid-js";
import Card from "./structure/Card";
import FieldsGroup from "./structure/FieldsGroup";
import SectionState from "./structure/SectionState";
import {SaveConfigurationViewModel} from "core-mapping/presentation/viewModels/SaveConfigurationViewModel";
import {saveConfigurationSectionTitleLabel} from "~/messages/saveConfigurationSectionMessages";

interface SaveConfigurationProps {
  viewModel: Resource<SaveConfigurationViewModel>;
}

export default function SaveConfigurationSection(props: SaveConfigurationProps) {
  return (
    <SectionState title={saveConfigurationSectionTitleLabel} resource={props.viewModel}>
      {(saveConfiguration) => (
        <Card title={saveConfigurationSectionTitleLabel}
              summary={`${saveConfiguration().title} (${saveConfiguration().mode})`}
              testId="save-configuration">
          <div class="fields-group-container">
            <FieldsGroup columns={() => saveConfiguration().modifiers.columns}/>
          </div>
        </Card>
      )}
    </SectionState>
  );
}
