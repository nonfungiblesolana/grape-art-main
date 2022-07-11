
import React, { useEffect } from "react";
import { styled, alpha } from '@mui/material/styles';
import { Link } from "react-router-dom";
import { decodeMetadata } from '../utils/grapeTools/utils'
// @ts-ignore
import fetch from 'node-fetch'
import { PublicKey } from '@solana/web3.js';
import InfiniteScroll from 'react-infinite-scroll-component';

import {
    Pagination,
    Stack,
    Typography,
    Grid,
    Box,
    Skeleton,
    ListItemButton,
    Container,
    Tooltip,
    InputBase,
    Button,
    FormControl,
    NativeSelect,
    InputLabel,
    LinearProgress
} from '@mui/material';


import { SelectChangeEvent } from '@mui/material/Select';

import SearchIcon from '@mui/icons-material/Search';

import GalleryItem from './GalleryItem';
import GalleryGroupItem from './GalleryGroupItem';
import { GRAPE_PREVIEW } from '../utils/grapeTools/constants';
import { ConstructionOutlined } from "@mui/icons-material";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '17px',
    backgroundColor: alpha(theme.palette.common.white, 0.015),
    '&:hover': {
        border: '1px solid rgba(255,255,255,0.75)',
        backgroundColor: alpha(theme.palette.common.white, 0.1),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 20,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        width: 'auto',
        marginLeft: 5,
    },
  }));

  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: alpha(theme.palette.common.white, 0.25),
  }));
  
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '100%',
      },
    },
  }));

export default function GalleryView(props: any){
    const [page, setPage] = React.useState(1);
    const rowsperpage = 1500;
    const mode = props?.mode || 0;
    const collectionAuthority = props?.collectionAuthority || null;
    const tokenPrice = props?.tokenPrice || null;
    //const [collectionMintList, setCollectionMintList] = props?.collectionMintList || null;
    const collectionMintList = props?.collectionMintList || null;
    const [finalMintList, setFinalMintList] = React.useState(collectionMintList);
    const finalCollection = props?.finalCollection || null;
    const [filterVal, setFilterVal] = React.useState("");
    const isparent = props?.isparent || false;
    const groupbysymbol = props?.groupbysymbol || null;
    //const walletCollection = props.walletCollection;
    const [foundList, setFoundList] = React.useState(null);
    const [initSorting, setInitSorting] = React.useState(false);
    const [sortingLoader, setSortingLoader] = React.useState(false);
    const scrollLimit = 20;

    // If a gallery item is groupBySymbol > 0
    // start searching how many are grouped so we can do this as a collective :) 

    const filter = (keyword:any) => {
        //const keyword = e.target.value;
        if (keyword !== '') {
          const results = collectionMintList.filter((listitem:any) => {
            //return listitem.name.toLowerCase().startsWith(keyword.toLowerCase())
            return listitem.name.toLowerCase().includes(keyword.toLowerCase())
            // Use the toLowerCase() method to make it case-insensitive
          });
            setFoundList(results);
            const tmpScrollList = (results && results?.length > 19) ? results.slice(0, 20) : results;
            setScrollData(tmpScrollList);
        } else {
            setFoundList(collectionMintList);
            const tmpScrollList = (collectionMintList && collectionMintList?.length > 19) ? collectionMintList.slice(0, 20) : collectionMintList;
            setScrollData(tmpScrollList);
        }
    
        setFilterVal(keyword);
    };

    const handleSortChange = (type:any) => {
        if (type !== '') {
            sortMintList(type);
        } 
    };

    function sortMintList(type:number){
        setFilterVal("");
        setSortingLoader(true);
        if (+type === 0){
            //collectionMintList.sort((a:any,b:any) => (a.listingPrice < b.listingPrice) ? 1 : -1);
            const sortedResults = collectionMintList.sort((a:any, b:any) => (a.listingPrice != null ? a.listingPrice : Infinity) - (b.listingPrice != null ? b.listingPrice : Infinity)) 
            //console.log("results: "+JSON.stringify(collectionMintList));
            setFoundList(sortedResults);
            const tmpScrollList = (sortedResults && sortedResults?.length > scrollLimit-1) ? sortedResults.slice(0, scrollLimit) : collectionMintList;
            setScrollData(tmpScrollList);
        } else if (+type === 1){
            /*
            const results = collectionMintList.filter((listitem:any) => {
                return listitem?.listingPrice > 0;
            });
            */
            //const sortedResults = results.sort((a:any, b:any) => (a.listingPrice < b.listingPrice ? 1 : -1));
            const sortedResults = collectionMintList.sort((a:any, b:any) => b.listingPrice - a.listingPrice) 
            setFoundList(sortedResults);
            const tmpScrollList = (sortedResults && sortedResults?.length > scrollLimit-1) ? sortedResults.slice(0, scrollLimit) : collectionMintList;
            setScrollData(tmpScrollList);
        } else if (+type === 2){ // by block time
            const thisCollectionMintList = collectionMintList;
            //const results = thisCollectionMintList.filter((listitem:any) => {
                //return listitem.name.toLowerCase().startsWith(keyword.toLowerCase())
            //    return listitem.listedBlockTime > 0;
            //});
            const sortedResults = collectionMintList.sort((a:any,b:any) => b.listedBlockTime - a.listedBlockTime)//(b.listedBlockTime != null ? b.listedBlockTime : Infinity) - (a.listedBlockTime != null ? a.listedBlockTime : Infinity));
            setFoundList(sortedResults);
            const tmpScrollList = (sortedResults && sortedResults?.length > scrollLimit-1) ? sortedResults.slice(0, scrollLimit) : collectionMintList;
            setScrollData(tmpScrollList);
        } else if (+type === 3){ // by offer count
            const sortedResults = collectionMintList.sort((a:any,b:any) => (a.offerCount - b.offerCount) ? 1 : -1);
            setFoundList(sortedResults);
            const tmpScrollList = (sortedResults && sortedResults?.length > scrollLimit-1) ? sortedResults.slice(0, scrollLimit) : collectionMintList;
            setScrollData(tmpScrollList);
        } else if (+type === 4){ // by highest offers
            const sortedResults = collectionMintList.sort((a:any, b:any) => (b.highestOffer != null ? b.highestOffer : Infinity) - (a.highestOffer != null ? a.highestOffer : Infinity)) 
            //const sortedResults = collectionMintList.sort((a:any, b:any) => (b.highestOffer - a.highestOffer) ? 1 : -1)
            setFoundList(sortedResults);
            const tmpScrollList = (sortedResults && sortedResults?.length > scrollLimit-1) ? sortedResults.slice(0, scrollLimit) : collectionMintList;
            setScrollData(tmpScrollList);
        } else if (+type === 5){ // by alphabetical
            const thisCollectionMintList = collectionMintList;
            //const results = thisCollectionMintList.filter((listitem:any) => {
            //    return listitem;
            //});
            const sortedResults = collectionMintList.sort((a:any,b:any) => (a.name.toLowerCase().trim() > b.name.toLowerCase().trim()) ? 1 : -1);
            setFoundList(sortedResults);
            const tmpScrollList = (sortedResults && sortedResults?.length > scrollLimit-1) ? sortedResults.slice(0, scrollLimit) : collectionMintList;
            setScrollData(tmpScrollList);
        }
        setSortingLoader(false);
    }

    //const [scrollData, setScrollData] = React.useState(null);
    const [scrollData, setScrollData] = React.useState(null);
    const [hasMoreValue, setHasMoreValue] = React.useState(true);

    const loadScrollData = async () => {
        try {
            if (foundList)
                setScrollData(foundList.slice(0, scrollData.length + scrollLimit));
        } catch (err) {
            console.log(err);
        }
    };

    const handleOnRowsScrollEnd = () => {
        if (foundList){
            if (scrollData.length < foundList?.length) {
                setHasMoreValue(true);
                loadScrollData();
            } else {
                setHasMoreValue(false);
            }
        }
    };

    const [scrollProfileData, setScrollProfileData] = React.useState((finalCollection && finalCollection?.length > 49) ? finalCollection.slice(0, 50) : collectionMintList)
    const [hasMoreProfileValue, setHasMoreProfileValue] = React.useState(finalCollection?.length > 49 ? true : false);

    const loadScrollProfileData = async () => {
        try {
            if (foundList)
                setScrollProfileData(foundList.slice(0, scrollData.length + scrollLimit));
        } catch (err) {
            console.log(err);
        }
    };

    const handleOnRowsScrollProfileEnd = () => {
        if (foundList){
            if (scrollData.length < foundList.length) {
                setHasMoreProfileValue(true);
                loadScrollProfileData();
            } else {
                setHasMoreProfileValue(false);
            }
        }
    };

    React.useEffect(() => {
        if (!initSorting && collectionMintList){
            //setScrollData((collectionMintList && collectionMintList?.length > scrollLimit-1) ? collectionMintList.slice(0, scrollLimit) : collectionMintList);
            setInitSorting(true);
            sortMintList(0);
            setTimeout(function() {
                setInitSorting(false);
            }, 500);
        } 
    }, [finalMintList])

    return (
        <>
            {mode === 1 ?
                <>
                    
                        <Box
                            sx={{
                                background: 'rgba(0, 0, 0, 0.6)',
                                borderRadius: '17px',
                                p:4
                            }} 
                        > 
                        
                            <Grid container 
                                spacing={{ xs: 1, md: 2 }} 
                                alignItems="flex-start"
                                >
                                <Grid item xs={0} sm={2}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="uncontrolled-native" sx={{height:'40px',m:0,p:0}}>Sort</InputLabel>
                                        <NativeSelect
                                            defaultValue={0}
                                            inputProps={{
                                                name: 'Sorting',
                                                id: 'uncontrolled-native',
                                              }}
                                            id="filter-select"
                                            onChange={(e) => handleSortChange(e.target.value)}
                                            sx={{borderRadius:'17px', height:'40px'}}
                                        >
                                            <option value={0}>Price Ascending</option>
                                            <option value={1}>Price Descending</option>
                                            <option value={2}>Recently Listed</option>
                                            <option value={3} disabled>Most Offers</option>
                                            <option value={4}>Highest Offers</option>
                                            <option value={5}>Alphabetical</option>
                                        </NativeSelect>
                                    </FormControl>
                                </Grid>    
                                
                                <Grid item xs={0} sm={10}>
                                    <Container
                                        component="form"
                                        //onSubmit={handlePublicKeySubmit}
                                        sx={{background:'none'}}
                                    >
                                        <Tooltip title='Filter Collection'>
                                            <Search
                                                sx={{height:'40px'}}
                                            >
                                                <SearchIconWrapper>
                                                    <SearchIcon />
                                                </SearchIconWrapper>
                                                <StyledInputBase
                                                    sx={{height:'40px', width:'100%'}}
                                                    placeholder='Filter Collection'
                                                    inputProps={{ 'aria-label': 'search' }}
                                                    onChange={(e) => filter(e.target.value)}
                                                    value={filterVal}
                                                />
                                            </Search>
                                        </Tooltip>
                                    </Container>
                                </Grid>
                            </Grid>
                        {!initSorting && !sortingLoader && scrollData && foundList && foundList.length > 0 && (
                            <Grid container 
                                spacing={{ xs: 2, md: 3 }} 
                                alignItems="flex-start"
                                >
                            
                                <Grid item xs={0} sm={2}>
                                    {collectionAuthority && collectionAuthority?.attributes &&
                                        <>  
                                            {Object.keys(collectionAuthority.attributes).map(key => 
                                                <Button variant="outlined" sx={{m:1,color:'white',borderColor:'white',borderRadius:'17px'}} disabled>{key}</Button>
                                            )/* {JSON.stringify(collectionAuthority.attributes[key])} */}
                                        </>
                                    }
                                </Grid>
                                <Grid item xs={12} sm={10}>
                                    <InfiniteScroll
                                        dataLength={scrollData.length}
                                        next={handleOnRowsScrollEnd}
                                        hasMore={hasMoreValue}
                                        scrollThreshold={1}
                                        loader={!scrollData && <p><LinearProgress /></p>}
                                        // Let's get rid of second scroll bar
                                        style={{ overflow: "unset" }}
                                    >
                                        <Grid container 
                                            spacing={{ xs: 2, md: 3 }} 
                                            justifyContent="center"
                                            alignItems="center">
                                            {scrollData.map((collectionInfo:any, key:number) => {
                                                return(
                                                    <>
                                                        {collectionInfo?.image ?
                                                            <Grid item xs={12} sm={12} md={4} lg={3} xl={2}>
                                                                <Box
                                                                    sx={{
                                                                        background: 'rgba(0, 0, 0, 0.6)',
                                                                        borderRadius: '26px',
                                                                        minWidth: '175px'
                                                                    }} 
                                                                >
                                                                    <GalleryItem collectionitem={collectionInfo} mode={mode} groupbysymbol={collectionInfo.groupBySymbol} tokenPrice={tokenPrice} isparent={false} listed={true} count={key} />
                                                                </Box>
                                                            </Grid>
                                                        :
                                                        <></>
                                                        }
                                                    </>
                                                )
                                            })}
                                        </Grid>
                                    </InfiniteScroll>
                                </Grid>
                            </Grid>
                        )}
                        </Box>
                </>
            :
                <>
                {finalCollection && finalCollection.length > 0 && (
                    <Box
                        sx={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: '17px',
                            p:4
                        }} 
                    > 

                        {/*
                        <InfiniteScroll
                            dataLength={scrollProfileData?.length}
                            next={handleOnRowsScrollProfileEnd}
                            hasMore={hasMoreProfileValue}
                            scrollThreshold={1}
                            loader={<p><LinearProgress /></p>}
                            // Let's get rid of second scroll bar
                            style={{ overflow: "unset" }}
                        >
                            <Grid container 
                                spacing={{ xs: 2, md: 3 }} 
                                justifyContent="center"
                                alignItems="center">
                                {scrollProfileData && scrollProfileData.map((collectionInfo:any, key:number) => {
                                    return(
                                        <>
                                            {(collectionInfo.groupBySymbol > 1) ? (
                                                <>
                                                {(collectionInfo.groupBySymbolIndex === 0) && (
                                                    <GalleryGroupItem groupCollection={finalCollection} mode={mode} symbol={collectionInfo.meta.data.symbol} isparent={true} key={key} />
                                                )}
                                                </>
                                            ):(
                                                <Grid item xs={12} sm={12} md={4} lg={3} xl={2} key={key}>
                                                    <Box
                                                        sx={{
                                                            background: 'rgba(0, 0, 0, 0.6)',
                                                            borderRadius: '26px',
                                                            minWidth: '175px'
                                                        }} 
                                                    >
                                                        <GalleryItem collectionitem={collectionInfo} mode={mode} groupbysymbol={collectionInfo.groupBySymbol} isparent={false} finalCollection={finalCollection} listed={true} count={key} />
                                                    </Box>
                                                </Grid>
                                            )}
                                        </>   
                                    )
                                })}
                            </Grid>
                        </InfiniteScroll>
                        */}


                        <Grid container 
                            spacing={{ xs: 2, md: 3 }} 
                            justifyContent="center"
                            alignItems="center">
                            


                            { (finalCollection.length > 0 ? finalCollection
                                .slice((page - 1) * rowsperpage, page * rowsperpage):finalCollection)
                                .map((collectionInfo: any, key: any) => {
                                    return(
                                        <>
                                            {(collectionInfo.groupBySymbol > 1) ? (
                                                <>
                                                {(collectionInfo.groupBySymbolIndex === 0) && (
                                                    <GalleryGroupItem groupCollection={finalCollection} mode={mode} symbol={collectionInfo.meta.data.symbol} isparent={true} key={key} />
                                                )}
                                                </>
                                            ):(
                                                
                                                <Grid item xs={12} sm={12} md={4} lg={3} xl={2} key={key}>
                                                    <Box
                                                        sx={{
                                                            background: 'rgba(0, 0, 0, 0.6)',
                                                            borderRadius: '26px',
                                                            minWidth: '175px'
                                                        }} 
                                                    >
                                                        <GalleryItem collectionitem={collectionInfo} mode={mode} groupbysymbol={collectionInfo.groupBySymbol} isparent={false} finalCollection={finalCollection} listed={true} count={key} />
                                                    </Box>
                                                </Grid>
                                            )}
                                        </>   
                                    )
                                }
                            )}


                        </Grid>
                    </Box>
                    
                )}
                </>
            }
        </>);
}