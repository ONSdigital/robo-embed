<script>
  import { base } from "$app/paths";
  import { getPlace } from "$lib/utils";
  import { regions } from "$lib/config";
  import {
    Embed,
    AnalyticsBanner,
    analyticsEvent,
    Highlight,
    Section,
    Grid,
    GridCell,
    Select,
    Button,
    Notice,
    Details,
    Container,
  } from "@onsvisual/svelte-components";
  import { Chart } from "@onsvisual/svelte-charts";
  import ChartActions from "$lib/layout/ChartActions.svelte";
  import SummaryItem from "$lib/layout/SummaryItem.svelte";
  import RoboMap from "$lib/layout/RoboMap.svelte";  

  export let data;

  $: console.log(data.place.sections);

  let selected;
  let clearInput;

  let twistyOpen = true;

  async function doSelect(code, click = false) {
    code = data.places.find(p => p.areacd === code) ? code : "default";
    twistyOpen = code === "default" ? true : false;
    document.getElementById("top")?.scrollIntoView();

    data.place = await getPlace(`${base}/data/json/${code}.json`);

    data.place.sections.forEach(d=>{
      if(d.type=='Chart' && d.chartType=='line' && d.xScale=='time'){
        d.data.forEach(function(e){
          e.x = new Date (e.x)
        })
      }
    });
    
    selected = null;
    clearInput();
    // console.log(e);
    document.getElementById("select").blur();
    // e.currentTarget.blur();
    // window.scrollTo(0,0);
    analyticsEvent({
      event: click ? "clickSelect" : "searchSelect",
      areaCode: data.place?.place?.areacd || null,
      areaName: data.place?.place?.areanm || null,
    });
  }

  function init(e) {
    const parent = e.detail.parentUrl;
    const code = parent ? parent.split("#")[1] : null;
    doSelect(code);
  }

  const analyticsProps = (() => {
    const props = {};
    for (const key in [
      "contentTitle",
      "releaseDate",
      "outputSeries",
      "contentType",
    ]) {
      if (data?.meta?.[key]) props[key] = data.meta[key];
    }
    return props;
  })();
</script>

<svelte:head>
  <title>{data?.meta?.title || ""}</title>
  <meta name="description" content={data?.meta?.description || ""} />
  <meta name="robots" content="noindex" />
  <meta name="googlebot" content="indexifembedded" />
</svelte:head>

<AnalyticsBanner {analyticsProps} hideBanner />

<Embed on:load={init}>
  {#each data.place.sections as section}
    {#if section.type === "Meta"}
      <!-- meta -->
    {:else if section.type === "Header"}
      <img src="{base}/img/header.png" alt="" />
      <Highlight width="medium" id="top" marginBottom={false} theme="paleblue" themeOverrides
      ={{"--ons-color-text": "var(--ons-color-ocean-blue)"}}>
        <div class="header-block">
          {#if section.title}<h2 aria-live="polite">{section.title}</h2>{/if}
          <form class="select-form" on:submit|preventDefault={() => doSelect(selected?.areacd)}>
            <div style:padding-right="6px" style:flex-grow="1">
              <Select
                id="select"
                label={section.label}
                labelKey="areanm"
                options={data.places}
                bind:value={selected}
                bind:clearInput
                placeholder="Type an area name..."
              />
            </div>
            <div style:padding="6px 0 3px" style:flex-shrink="1">
              <Button type="sumbit" small>Select area</Button>
            </div>
          </form>
          {#if data.place.place}<a href="#0" on:click={() => doSelect("default")}>Clear selected area</a>{/if}
        </div>
      </Highlight>
    {:else if section.type === "Highlight"}
      <Highlight
        id={section.id}
        marginTop={false}
        marginBottom={false}
        theme="light"
      >
        <span style:font-weight="normal">
          {@html section.content || ""}
        </span>
      </Highlight>
    {:else if section.type === "Chart" && section.chartType}
      <Grid width="narrow">
        <div class="chart-outer">
          <Chart {section} />
          {#if section.note}
            <div class="chart-note">{section.note}</div>
          {/if}
        </div>
        <ChartActions {section} place={data.place.place} />
      </Grid>
    {:else if section.type === "Summary"}
      <Section
        id={section.id}
        title={section.title}
        marginTop
        marginBottom={false}
      />
      <Grid width="narrow" colwidth="full" height={100}>
        {#each section.sections as sub}
          <SummaryItem section={sub} />
        {/each}
      </Grid>
    {:else if section.type === "Warning"}
      <Section cls="section-warning">
        <Notice mode="warning" important>
          {@html section.content || ""}
        </Notice>
      </Section>
    {:else if section.type === "Map"}
      <Section cls="section-map">
        <RoboMap {section} height={section.height}></RoboMap>
      </Section>
    {:else}
      <Section id={section.id} title={section.title}>
        {@html section.content || ""}
      </Section>
    {/if}
  {/each}

  <Container marginTop={!data.place.place ? true : false} marginBottom>
    <Details title="All versions of this article" bind:open={twistyOpen}>
      <Grid colWidth="narrow">
        {#each regions as region}
          {#each [data.places.filter((p) => p.parentcd === region.cd)] as places}
            {#if places[0]}
              <GridCell>
                <strong>{region.nm}</strong>
                <div style:font-size="smaller">
                  {#each places as place}
                    <button
                      class="btn-link"
                      on:click={(e) => doSelect(place.areacd, true)}
                      >{place.areanm}</button
                    ><br />
                  {/each}
                </div>
              </GridCell>
            {/if}
          {/each}
        {/each}
      </Grid>
    </Details>
  </Container>
</Embed>

<style>
  :global(.ons-feature__filler label) {
    margin-top: 12px !important;
  }
  :global(.ons-feature__filler h2) {
    margin-bottom: 0 !important;
  }
</style>