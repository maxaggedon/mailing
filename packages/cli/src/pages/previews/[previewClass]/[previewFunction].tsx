import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../../components/Header";
import HotIFrame from "../../../components/HotIFrame";
import MjmlErrors from "../../../components/MjmlErrors";
import { NextPage } from "next";
import { hotkeysMap } from "../../../components/hooks/usePreviewHotkeys";
import useLiveReload from "../../../components/hooks/useLiveReload";

const Preview: NextPage = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [data, setData] = useState<ShowPreviewResponseBody | null>(null);
  useLiveReload(async function fetchPreview() {
    const response = await fetch(`/api/${document.location.pathname}`);
    setData(await response.json());
  });

  const { previewClass, previewFunction } = router.query;

  if (!(previewClass && previewFunction)) {
    return <></>;
  }

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
      {!!data?.errors.length && <MjmlErrors errors={data.errors} />}
      {data?.html && !data?.errors.length && (
        <HotIFrame
          srcDoc={data.html}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      <style jsx>{`
        iframe {
          margin-top: 8px;
          height: calc(100vh - 50px);
          width: 100%;
          max-width: ${viewMode === "mobile" ? "320px" : "100%"};
          border: 0;
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
