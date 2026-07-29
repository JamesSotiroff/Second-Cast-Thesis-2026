# Second Cast model methodology

## Status and evidence standard

This document describes the model currently implemented in `src/lib/model/` and
`src/data/midwest/`, checked against `public/docs/ACADIA_2026_Second_Cast.pdf`.
It distinguishes statements made by the ACADIA submission from values and
relationships that currently exist only in code. A constant named `THESIS_*`, a
UI label, or a default preset is not by itself evidence that the submission
published that value. Provisional inputs and formulas below are implementation
assumptions for exploration; they are not authoritative thesis data.

The code evaluates three panel scenarios: solid concrete, optimized composite,
and king-stud composite. Results are calculated at panel and project scale.

## Quantities and units

- Panel dimensions are represented in feet and converted with
  \(1\ \mathrm{ft}=0.3048\ \mathrm{m}\). Width and height are each 4 ft
  (1.2192 m); thickness is 4 in, or \(4/12\) ft (0.1016 m).
- Panel volume is \(V=W H T\), in m³. The current carbon and cost calculations
  do not use this volume or derive mass from density.
- Masses are in kg. Material emission factors are kg CO₂ per kg of material.
- Manufacturing energy is kWh per panel, and grid intensity is kg CO₂/kWh.
- Haul distances are km. Truck emissions are kg CO₂ per vehicle-km per load.
- Costs are USD per kg, tonne, panel, km, or load as identified by each input.
  Carbon price is USD/t CO₂.
- Percent/share inputs are represented internally as fractions from 0 to 1.

## Geometry and scenario mass equations

The submission describes a 4 ft × 4 ft × 4 in panel with an offset opening
(Section 3), an optimized panel mass of approximately 156 kg (Figure 7), and a
king-stud comparison panel mass of approximately 168 kg (Figure 8). It reports
up to 33% mass reduction relative to a solid panel (Section 4).

The code defines the solid reference indirectly:

\[
m_\mathrm{solid}=\frac{156}{1-0.33}\approx232.84\ \mathrm{kg}.
\]

For the user-selected optimization reduction \(r\):

\[
m_\mathrm{optimized}=m_\mathrm{solid}(1-r).
\]

The solid scenario always uses \(m_\mathrm{solid}\). The king-stud scenario
interpolates from the derived solid reference at zero reduction to the measured
168 kg reference at \(r=0.33\):

\[
m_\mathrm{king}=m_\mathrm{solid}+
\left(168-m_\mathrm{solid}\right)\frac{r}{0.33}.
\]

The implementation clamps \(r\) to \([0,0.33]\). The interpolation is a
provisional implementation choice; only the 168 kg endpoint is thesis-cited.

Project mass is

\[
M_\mathrm{project}=N\,m_\mathrm{panel},
\]

where \(N\) is panel count.

## Material inventory equations

The PDF reports mixture testing across twenty tests and identifies accelerator,
sand, cement, polymer, timing, density grading, and concrete-to-foam ratio as
variables (Figure 3). It does not provide the mass fractions or emission
factors encoded by this application.

For requested foam fill fraction \(f\), code first defines an effective fraction:

\[
f_\mathrm{eff}=
\begin{cases}
0 & \text{solid}\\
0.75f & \text{king-stud}\\
f & \text{optimized}
\end{cases}
\]

and clamps it to \([0,0.85]\), giving
\(f_c=\min(\max(f_\mathrm{eff},0),0.85)\). It then calculates:

\[
m_\mathrm{foam}=0.35\,f_c\,m_\mathrm{panel},
\qquad
m_\mathrm{struct}=m_\mathrm{panel}-m_\mathrm{foam}.
\]

The structural inventory is:

\[
\begin{aligned}
m_\mathrm{cement}&=0.220\,m_\mathrm{struct}\\
m_\mathrm{sand}&=0.380\,m_\mathrm{struct}\\
m_\mathrm{polymer}&=0.015\,m_\mathrm{struct}\\
m_\mathrm{accelerator}&=0.002\,m_\mathrm{struct}\\
m_\mathrm{aggregate}&=0.383\,m_\mathrm{struct}.
\end{aligned}
\]

For recycled aggregate share \(q\):

\[
m_\mathrm{recycled}=q\,m_\mathrm{aggregate},\qquad
m_\mathrm{virgin}=(1-q)m_\mathrm{aggregate}.
\]

Foaming agent is calculated as
\(m_\mathrm{foamAgent}=0.04\,m_\mathrm{foam}\).
These coefficients, the 0.35 foam mass multiplier, the king-stud 0.75 factor,
and the 0.85 cap are code-only provisional assumptions. The inventory also
reports foam-crete and foaming agent as separate masses; whether the latter is
already contained in the former must be resolved before interpreting the sum
as a physical bill of materials.

## Carbon equations and manufacturing/transport boundary

For one panel, material emissions are the sum of material mass \(m_i\) times
factor \(e_i\):

\[
C_\mathrm{mat,panel}=\sum_i m_i e_i.
\]

All material factors used by the engine are represented in the typed model
inputs and exposed in the interface: cement, sand, polymer, foaming agent,
accelerator, virgin aggregate, recycled aggregate, and foam-crete. Manufacturing
electricity and trucking factors are also configurable. Their defaults remain
provisional unless identified above as thesis-cited.

At project scale:

\[
\begin{aligned}
C_\mathrm{materials}&=N\,C_\mathrm{mat,panel}\\
C_\mathrm{manufacturing}&=N\,E_\mathrm{panel}\,e_\mathrm{grid}\\
C_\mathrm{transport}&=D_\mathrm{vehicle}\,e_\mathrm{truck}\\
C_\mathrm{total}&=C_\mathrm{materials}+C_\mathrm{manufacturing}
+C_\mathrm{transport}.
\end{aligned}
\]

The submission's environmental analysis is expressly limited to manufacturing
and transportation impacts and excludes operational performance, including
thermal behavior (Section 4 and Figure 10). Figure 9 defines a production batch
of 26 panels, one flatbed load arranged in one layer, and a building site 150 km
from the manufacturing facility and recycling source on a one-way trip.

The application's current accounting boundary needs careful interpretation:
it presents a distinct material-emissions term in addition to manufacturing
energy and transport. The PDF text available in the repository does not state
the numerical factors or enough process-boundary detail to determine whether
this material term reproduces, extends, or double-counts the submission's
“manufacturing and transportation” analysis. No claim of equivalence should be
made until the Figure 9 source calculation is reconciled with the code.

The validated wall-panel model does not calculate operational energy, thermal
behavior, service life, maintenance, end of life, carbonation, or
construction/installation. Separate experimental research calculators can
explore thermal/operational and circular material-flow scenarios, and their
outputs are intentionally kept outside this thesis boundary.

## Transport equations

Panel-delivery loads for \(N>0\) panels and batch capacity \(B>0\) are:

\[
L_p=\left\lceil\frac{N}{B}\right\rceil.
\]

Recycled-material loads use total recycled aggregate mass \(M_r\) and payload
capacity \(P_r\):

\[
L_r=\left\lceil\frac{M_r}{P_r}\right\rceil.
\]

For each leg \(j\), with one-way distance \(d_j\) and round-trip switch \(R\):

\[
D_j=d_j\,L_j
\begin{cases}
2 & R=\mathrm{true}\\
1 & R=\mathrm{false}.
\end{cases}
\]

The default application inputs use \(N=B=26\), \(d=150\) km, and include a
return trip for finished-panel delivery, producing 300 vehicle-km on that leg.
The 26-panel load and 150 km one-way distance are thesis-cited; automatic
inclusion of the return trip is a code default, not a statement in the PDF.
The recycled-material source distance and 18,000 kg payload default are
provisional. Transport emissions remain vehicle-km based rather than tonne-km
based.

## Cost equations

The economic extension is implemented in code but is not part of the
environmental equations documented in the PDF. For one panel:

\[
\begin{aligned}
K_\mathrm{materials,panel}={}&
m_c k_c+m_s k_s+m_p k_p+m_f k_f+m_a k_a\\
&+\frac{m_\mathrm{recycled}}{1000}k_\mathrm{rubble,tonne}
+\frac{m_\mathrm{virgin}}{1000}k_\mathrm{virgin,tonne}.
\end{aligned}
\]

At project scale:

\[
\begin{aligned}
K_\mathrm{materials}&=N K_\mathrm{materials,panel}\\
K_\mathrm{formwork}&=N k_\mathrm{formwork,panel}\\
K_\mathrm{labor}&=N k_\mathrm{labor,panel}\\
K_\mathrm{transport}&=\sum_{j\in\{p,r\}}
\left(D_j k_\mathrm{truck,km}+L_j k_\mathrm{truck,base}\right)\\
K_\mathrm{carbon}&=\frac{C_\mathrm{total}}{1000}k_\mathrm{CO2,tonne}\\
K_\mathrm{total}&=K_\mathrm{materials}+K_\mathrm{formwork}
+K_\mathrm{labor}+K_\mathrm{transport}+K_\mathrm{carbon}.
\end{aligned}
\]

Foam-crete is represented as a material carbon term but does not have an
independent purchase-cost input. All default unit costs, the carbon price, and the Ann Arbor,
Detroit, Chicago, Columbus, and Midwest adjustments are provisional code
inputs. Repository text itself calls the regional values placeholders; they
must not be represented as verified MISO, NRMCA, supplier, or market data.

## Thesis-cited inputs and provisional assumptions

Directly supported by the repository PDF:

- panel dimensions: 4 ft × 4 ft × 4 in;
- optimized panel mass: approximately 156 kg;
- king-stud panel mass: approximately 168 kg;
- reported outcome: up to 33% mass reduction and approximately 30% embodied
  carbon reduction relative to solid concrete;
- Figure 9 case: 26 panels per single-layer flatbed load and 150 km one-way
  distance from manufacturing/recycling source to site;
- twenty foam-concrete mixture tests and the qualitative variables listed in
  Figure 3;
- environmental scope limited to manufacturing and transportation, with
  operational/thermal performance excluded.

Provisional implementation assumptions not numerically substantiated by the PDF:

- all material, electricity, and trucking emission-factor values;
- all mix coefficients and foam/king-stud adjustment factors;
- manufacturing energy of 8.5 kWh/panel and grid intensity of
  0.45 kg CO₂/kWh;
- default 100% recycled aggregate and 45% foam fill;
- inclusion of a truck return trip by default;
- every unit cost, regional preset, city haul distance, and carbon price;
- linear scaling with panel count and optimization percentage;
- identical manufacturing energy per panel across scenarios;
- the derived 232.84 kg solid mass rather than an independently reported or
  measured solid-panel mass.

## Known limitations

- The PDF provides headline results but not a complete numerical life-cycle
  inventory, Figure 9 calculation sheet, or source list for factors; the code
  cannot presently be audited back to those results term by term.
- There is no uncertainty, sensitivity distribution, data vintage, geography,
  supplier specificity, or factor provenance.
- Topology, opening geometry, branch dimensions, concrete-to-foam spatial
  grading, and density are not solved. Panel mass is assigned by scenario and a
  user reduction parameter.
- Structural behavior is not calculated. The PDF describes Peregrine simulations
  using dead and wind loads and a king-stud casting for comparison, but the app
  contains no load cases, capacity checks, test results, failure modes, or safety
  factors. “Without compromising structural capacity” remains a thesis design
  objective, not a result validated by this model.
- Material fractions are fixed and do not derive from the twenty mixture tests.
  Moisture, yield, waste, curing, reinforcement, formwork material, and rigid
  foam used in fabrication are absent from the carbon inventory.
- Manufacturing is represented only as constant electricity per panel. The
  two-stage casting sequence described in Figure 6 is not modeled.
- Finished-panel capacity is panel-count based and recycled-material capacity
  is mass based. Partial loads incur a whole load; routing, vehicle class, and
  utilization are not independently modeled.
- Costs omit a distinct foam-crete purchase term and do not include
  overhead, equipment, capital, installation, taxes, escalation, or uncertainty.
- Percent comparisons use the same inputs for all scenarios; common fixed
  manufacturing and transport terms can materially influence the reduction.
- Public wall-model inputs are normalized to finite, nonnegative values and
  documented share bounds. This prevents invalid arithmetic but does not replace
  domain validation of plausible engineering ranges.

## Validation targets

The current validation helper compares optimized and solid scenarios under the
active inputs:

\[
\Delta M=100\frac{m_\mathrm{solid}-m_\mathrm{optimized}}
{m_\mathrm{solid}},
\qquad
\Delta C=100\frac{C_\mathrm{solid}-C_\mathrm{optimized}}
{C_\mathrm{solid}}.
\]

The repository UI identifies approximately 33% mass reduction and approximately
30% carbon reduction as submission targets. The mass target is guaranteed by
the optimized mass equation when \(r=0.33\); it is therefore an equation
consistency check, not independent validation. The carbon target should be
treated as a calibration/reproduction target only after the submission's
inventory and boundaries are recovered.

Further validation targets supported by repository evidence are:

1. reproduce approximately 156 kg for the optimized panel and 168 kg for the
   king-stud panel at explicitly defined reference settings;
2. reproduce the 26-panel, one-load, 150 km one-way Figure 9 logistics case
   without silently adding an unsupported trip leg;
3. reconcile each carbon term and factor with the Figure 9 source calculation,
   then verify the approximately 30% comparison;
4. compare modeled material quantities and densities with the twenty mixture
   tests before using mix-derived results predictively;
5. keep structural, thermal, acoustic, and fire claims outside model outputs
   until corresponding simulations or physical tests are connected.

Automated unit tests cover reference masses, material balance, batching,
transport legs, costs, input normalization, and the headline target ranges.
Browser smoke tests cover navigation, interactive scenario changes, research
module selection, and PDF delivery under the GitHub Pages base path.

## Planned research module boundaries

The repository now includes experimental slab, column, thermal/operational, and
circular-design calculators. They establish typed boundaries and validated
arithmetic but use provisional demonstration assumptions; they do not establish
structural, code, or environmental performance claims.

1. **Evidence and provenance module:** source every factor, mix result, measured
   mass, date, geography, uncertainty, and system boundary. This module should
   distinguish PDF observations from calibrated and hypothetical inputs.
2. **Geometry/topology module:** own panel dimensions, openings, optimized load
   paths, branch thickness, concrete/foam spatial allocation, and volume. It
   should emit geometry and quantities, not carbon conclusions.
3. **Mixture and material-inventory module:** own the twenty-test dataset,
   density grading, mix yield, constituent quantities, curing, waste, and
   recycled/virgin allocation. It should emit a mass-balanced bill of materials.
4. **Structural validation module:** own dead/wind load cases, Peregrine model
   provenance, king-stud comparison, physical test data, capacity, and failure
   criteria. It should remain independent of environmental calibration.
5. **Manufacturing module:** own the two-stage formwork/casting process,
   electricity and other energy, equipment, consumables, formwork and rigid
   foam, labor, yield, and plant-specific factors.
6. **Logistics module:** own source-to-plant and plant-to-site legs, payload and
   vehicle limits, batching, routing, return assumptions, and tonne-km or
   vehicle-km factors.
7. **Environmental accounting module:** consume documented inventories from
   geometry, materials, manufacturing, and logistics; enforce a declared
   life-cycle boundary; and report contributions without overlap.
8. **Economics module:** consume physical quantities while keeping prices,
   dates, geography, overhead, and uncertainty separate from environmental
   factors.
9. **Operational-performance module:** thermal behavior is explicitly outside
   the present submission analysis. Any future thermal, acoustic, fire, service
   life, or operational-energy work should be a separate module and must not be
   implied by current embodied-carbon results.
10. **Application-expansion module:** floor slabs, columns, assembly/disassembly,
    and other circular strategies are identified by the PDF as future
    applications. They should not reuse wall-panel assumptions without new
    geometry, structural, manufacturing, and validation evidence.

These boundaries preserve the current wall study's limited evidence while
allowing later research to replace provisional constants with traceable data.
