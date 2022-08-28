import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../../components/Header";
import HotIFrame from "../../../components/HotIFrame";
import MjmlErrors from "../../../components/MjmlErrors";
import { GetStaticProps, NextPage } from "next";
import { hotkeysMap } from "../../../components/hooks/usePreviewHotkeys";
import useLiveReload from "../../../components/hooks/useLiveReload";
import { render } from "../../../util/mjml";
import {
  getPreviewComponent,
  previewTree,
} from "../../../util/moduleManifestUtil";
import IndexPane from "../../../components/IndexPane/IndexPane";

type Params = { previewClass: string; previewFunction: string };

export const getStaticPaths = async () => {
  let paths: {
    params: Params;
  }[] = [];

  const previews: [string, string[]][] = previewTree();

  previews.forEach((previewClass) => {
    paths = paths.concat(
      previewClass[1].map((previewFunction) => ({
        params: {
          previewClass: previewClass[0],
          previewFunction,
        },
      }))
    );
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { previewFunction, previewClass } = context.params as Params;
  const component = getPreviewComponent(previewClass, previewFunction);

  const preview = render(component);

  return {
    props: { initialData: { preview, previews: previewTree() } },
    revalidate: 1,
  };
};

type Data = {
  preview: ShowPreviewResponseBody;
  previews: [string, string[]][];
};

type PreviewProps = {
  initialData: Data;
};

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
}

const Preview: NextPage<PreviewProps> = ({ initialData }) => {
  const router = useRouter();
  const { previewClass, previewFunction } = router.query;
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [data, setData] = useState<Data | null>(initialData);
  const fetchData = useCallback(async () => {
    if (!previewClass || !previewFunction) return;
    const json = await Promise.all([
      fetchJson(`/api/previews/${previewClass}/${previewFunction}`),
      // fetchJson("/api/previews"),
    ]);
    setData({
      preview: json[0],
      previews: json[0].previews,
    });
  }, [setData, previewClass, previewFunction]);
  useLiveReload(fetchData);

  const { preview, previews } = data;

  const showNullState =
    previews.length === 0 ||
    (previews.length === 2 &&
      previews[0][0] === "TextEmail.tsx" &&
      previews[1][0] === "Welcome.tsx" &&
      !process.env.NEXT_PUBLIC_STATIC);

  return (
    <div>
      <Header
        title={`${previewClass} - ${previewFunction}`}
        previewClass={previewClass as string}
        previewFunction={previewFunction as string}
        viewMode={viewMode}
        setViewMode={setViewMode}
        helpContent={
          <>
            <div className="title">Hotkeys</div>
            <div className="hotkey">
              <span className="character">{hotkeysMap.showPreviews}</span>
              <span className="description">Jump to previews</span>
            </div>
            <div className="hotkey">
              <span className="character">{hotkeysMap.viewModeNext}</span>
              <span className="description">Next view mode</span>
            </div>
            <div className="hotkey">
              <span className="character">{hotkeysMap.viewModePrevious}</span>
              <span className="description">Previous view mode</span>
            </div>
            <div className="hotkey">
              <span className="character">{hotkeysMap.viewModeDesktop}</span>
              <span className="description">Desktop view</span>
            </div>
            <div className="hotkey">
              <span className="character">{hotkeysMap.viewModeMobile}</span>
              <span className="description">Mobile view</span>
            </div>
            <div className="hotkey">
              <span className="character">{hotkeysMap.viewModeHTML}</span>
              <span className="description">HTML view</span>
            </div>
          </>
        }
      />
      <div className="relative">
        <div className="left-pane">
          {showNullState && (
            <div className="null-sub">
              Build new email templates in <span className="code">emails</span>.
              Add previews to <span className="code">emails/previews</span> and
              they’ll appear below.
            </div>
          )}
          <IndexPane previews={previews} />
        </div>
        <div className="right-pane">
          {!!preview?.errors.length && <MjmlErrors errors={preview?.errors} />}
          {preview?.html && !preview?.errors.length && (
            <HotIFrame
              srcDoc={preview.html}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          )}
        </div>
      </div>
      <style jsx>{`
        .left-pane {
          width: 300px;
          position: absolute;
          top: 65px;
          bottom: 0;
          left: 0;
          overflow: scroll;
        }
        .right-pane {
          position: absolute;
          top: 65px;
          bottom: 0;
          right: 0;
          left: 300px;
          width: calc(100vw - 300px);
        }
        .title {
          padding-bottom: 4px;
        }
        .title,
        .character {
          text-transform: uppercase;
          font-size: 10px;
          line-height: 100%;
        }
        .hotkey {
          font-size: 12px;
          margin: 12px 24px 0 0;
        }
        .character {
          color: #bbb;
          width: 18px;
          height: 18px;
          border: solid 1px #999;
          border-radius: 2px;
          text-align: center;
          margin-right: 8px;
          display: inline-block;
          line-height: 170%;
        }
        .description {
          position: relative;
          top: 1.25px;
        }
      `}</style>
    </div>
  );
};

export default Preview;
