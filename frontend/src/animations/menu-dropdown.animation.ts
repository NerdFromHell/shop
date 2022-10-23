import {
  animate,
  query,
  sequence,
  stagger,
  style,
  transition,
  trigger
} from "@angular/animations";

export const DropDownAnimation = trigger("dropDownMenu", [
  transition(":enter", [
    style({ height: 0, overflow: "hidden" }),
    query(".mat-toolbar-row", [
      style({ opacity: 0, transform: "translateY(-50px)" })
    ]),
    sequence([
      animate("200ms", style({ height: "*" })),
      query(".mat-toolbar-row", [
        stagger(-50, [
          animate("300ms ease", style({ opacity: 1, transform: "none" }))
        ])
      ])
    ])
  ]),

  transition(":leave", [
    style({ height: "*", overflow: "hidden" }),
    query(".mat-toolbar-row", [style({ opacity: 1, transform: "none" })]),
    sequence([
      query(".mat-toolbar-row", [
        stagger(50, [
          animate(
            "180ms ease",
            style({ opacity: 0, transform: "translateY(-50px)" })
          )
        ])
      ]),
      animate("200ms", style({ height: 0 }))
    ])
  ])
]);
