import {Accessor, createEffect, JSX, Resource, Show} from "solid-js";
import {SaveValidationMessageViewModel} from "core-mapping/presentation/viewModels/SaveFileValidationViewModel";
import Spinner from "~/components/structure/Spinner";
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

export default function SectionState<ViewModel extends SectionViewModel>(props: SectionStateProps<ViewModel>) {
  createEffect(() => {
    if (props.resource.error) {
      console.error(props.resource.error);
    }
  });

  return (
    <Show when={!props.resource.loading} fallback={<><h3>{props.title}</h3><Spinner/></>}>
      <Show when={!props.resource.error}
            fallback={<><h3>{props.title}</h3><p class="text-color-danger">{sectionLoadingErrorMessage}</p></>}>
        <Show when={props.resource()}>
          {(viewModel) => (
            <Show when={viewModel().unreadableLines}
                  fallback={props.children(viewModel)}>
              {(unreadableLines) => <>
                <h3>{props.title}</h3>
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
