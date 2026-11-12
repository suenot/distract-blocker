const MASCOT_SVG = `
<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <!-- Sleep-state parts carry display="none" as a presentation attribute,
       so any CSS rule in the host page can switch them on. -->
  <ellipse class="m-shadow" cx="100" cy="206" rx="54" ry="6" fill="#1d3557" fill-opacity="0.18"/>

  <g class="m-body">
    <!-- feet -->
    <ellipse cx="82" cy="197" rx="14" ry="7" fill="#f4a261"/>
    <ellipse cx="118" cy="197" rx="14" ry="7" fill="#f4a261"/>

    <!-- body with ear tufts -->
    <path d="M100 42 C121 42 135 37 148 22 C158 46 167 74 167 112 C167 162 138 194 100 194 C62 194 33 162 33 112 C33 74 42 46 52 22 C65 37 79 42 100 42 Z"
          fill="#e63946" stroke="#e63946" stroke-width="6" stroke-linejoin="round"/>

    <!-- wings -->
    <path d="M40 114 C35 142 44 168 63 178 C63 152 55 130 40 114 Z" fill="#b3001b"/>
    <path d="M160 114 C165 142 156 168 137 178 C137 152 145 130 160 114 Z" fill="#b3001b"/>

    <!-- belly -->
    <ellipse cx="100" cy="161" rx="36" ry="26" fill="#fff6ea"/>
    <g fill="none" stroke="#e63946" stroke-opacity="0.45" stroke-width="2.4" stroke-linecap="round">
      <path d="M84 154 q5 5 10 0"/>
      <path d="M106 154 q5 5 10 0"/>
      <path d="M95 167 q5 5 10 0"/>
    </g>

    <!-- face -->
    <circle cx="74" cy="94" r="27" fill="#fff6ea"/>
    <circle cx="126" cy="94" r="27" fill="#fff6ea"/>
    <ellipse cx="100" cy="110" rx="21" ry="17" fill="#fff6ea"/>

    <g class="m-eyes-open">
      <g class="m-eye m-eye-l">
        <circle cx="77" cy="95" r="11" fill="#1d3557"/>
        <circle cx="80.5" cy="91" r="3.4" fill="#fff"/>
      </g>
      <g class="m-eye m-eye-r">
        <circle cx="123" cy="95" r="11" fill="#1d3557"/>
        <circle cx="126.5" cy="91" r="3.4" fill="#fff"/>
      </g>
    </g>

    <g class="m-eyes-closed" display="none" fill="none" stroke="#1d3557" stroke-width="3.2" stroke-linecap="round">
      <path d="M67 96 Q77 104 87 96"/>
      <path d="M113 96 Q123 104 133 96"/>
    </g>

    <!-- beak -->
    <path d="M93 102 Q100 99 107 102 Q105 110 100 113 Q95 110 93 102 Z" fill="#f4a261" stroke="#f4a261" stroke-width="2" stroke-linejoin="round"/>

    <path class="m-mouth-happy" d="M92 117 Q100 124 108 117" fill="none" stroke="#1d3557" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse class="m-mouth-sleep" display="none" cx="100" cy="120" rx="3.2" ry="2.6" fill="#1d3557"/>

    <!-- guard prop: shield with a pause sign ("not now") -->
    <g class="m-shield">
      <path d="M127 138 Q147 131 167 138 L167 158 Q167 176 147 185 Q127 176 127 158 Z"
            fill="#1d3557" stroke="#fff6ea" stroke-width="3" stroke-linejoin="round"/>
      <rect x="139" y="148" width="5.5" height="18" rx="2.75" fill="#fff6ea"/>
      <rect x="149.5" y="148" width="5.5" height="18" rx="2.75" fill="#fff6ea"/>
    </g>

    <g class="m-zzz" display="none" fill="none" stroke="#e63946" stroke-linecap="round" stroke-linejoin="round">
      <path d="M166 46 h16 l-16 18 h16" stroke-width="4"/>
      <path d="M185 20 h10 l-10 12 h10" stroke-width="3" stroke-opacity="0.7"/>
    </g>
  </g>
</svg>
`;

function renderMascot(container) {
  const doc = new DOMParser().parseFromString(MASCOT_SVG, "image/svg+xml");
  container.replaceChildren(doc.documentElement);
}
