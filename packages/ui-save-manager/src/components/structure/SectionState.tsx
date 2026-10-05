import {Accessor, createEffect, JSX, Resource, Show} from "solid-js";
import {SaveValidationMessageViewModel} from "core-mapping/save/presentation/viewModels/SaveValidationMessageViewModel";
import Spinner from "~/components/structure/Spinner";
import SectionTitle from "~/components/structure/SectionTitle";
import ValidationMessagesList from "~/components/validation/ValidationMessagesList";
import {sectionLoadingErrorMessage, sectionUnreadableLinesTitle} from "~/messages/sectionStateMessages";

interface SectionViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
}

interface SectionStateProps<ViewModel extends SectionViewModel> {
  title: string;
  resource: Resource<ViewModel>;
  children: (viewModel: Accessor<ViewModel>) => JSX.Element;
}

function findUnreadableLines(viewModel: SectionViewModel): SaveValidationMessageViewModel[] | undefined {
  return viewModel.unreadableLines?.length ? viewModel.unreadableLines : undefined;
}

export default function SectionState<ViewModel extends SectionViewModel>(props: SectionStateProps<ViewModel>) {
  createEffect(() => {
    if (props.resource.error) {
      console.error(props.resource.error);
    }
  });

  return (
    <Show when={!props.resource.loading} fallback={<><SectionTitle testId="section-state-title">{props.title}</SectionTitle><Spinner/></>}>
      <Show when={!props.resource.error}
            fallback={<><SectionTitle testId="section-state-title">{props.title}</SectionTitle><p class="message-group-title text-color-danger">{sectionLoadingErrorMessage}</p></>}>
        <Show when={props.resource()}>
          {(viewModel) => (
            <Show when={findUnreadableLines(viewModel())}
                  fallback={props.children(viewModel)}>
              {(unreadableLines) => <>
                <SectionTitle testId="section-state-title">{props.title}</SectionTitle>
                <ValidationMessagesList title={sectionUnreadableLinesTitle} severity="danger"
                                        messages={unreadableLines()} testId="section-unreadable-lines"/>
              </>}
            </Show>
          )}
        </Show>
      </Show>
    </Show>
  );
}
