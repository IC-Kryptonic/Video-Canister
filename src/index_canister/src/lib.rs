use ic_cdk::export::candid::{Principal};
use ic_cdk_macros::{update};
use ic_cdk::storage;

use std::collections::HashSet;
use std::collections::HashMap;

type VideoStore = HashMap<Principal,HashSet<Principal>>;

#[update]
pub async fn post_video(video_id: Principal){
    let store = storage::get_mut::<VideoStore>();
    
    let caller = ic_cdk::api::caller();

    let caller_videos = match store.get_mut(&caller){
        Some(caller_videos) => caller_videos,
        None => {
            store.insert(caller, HashSet::new());
            store.get_mut(&caller).unwrap()
        }
    };
    caller_videos.insert(video_id);
}