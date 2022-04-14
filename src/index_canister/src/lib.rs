use ic_cdk::export::candid::{Principal};
use ic_cdk_macros::{update, query, pre_upgrade, post_upgrade};
use ic_cdk::storage;

use std::collections::HashSet;
use std::collections::HashMap;

type VideoStore = HashMap<Principal,HashSet<Principal>>;

#[update]
pub async fn post_video(video_id: Principal){
    let caller = ic_cdk::api::caller();
    let store = storage::get_mut::<VideoStore>();
    
    let caller_videos = match store.get_mut(&caller){
        Some(caller_videos) => caller_videos,
        None => {
            store.insert(caller, HashSet::new());
            store.get_mut(&caller).unwrap()
        }
    };
    caller_videos.insert(video_id);
}

#[query]
pub async fn get_my_videos() -> Option<&'static HashSet<Principal>>{
    let caller = ic_cdk::api::caller();
    let store = storage::get_mut::<VideoStore>();

    return store.get(&caller);
}

#[pre_upgrade]
fn pre_upgrade() {
    let store = storage::get::<VideoStore>();
    storage::stable_save((store,)).unwrap();
}

#[post_upgrade]
fn post_upgrade() {
    let (store,): (VideoStore,) = storage::stable_restore().unwrap();

    *storage::get_mut::<VideoStore>() = store;
}